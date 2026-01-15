import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 拼音首字母生成函数
function getPinyinAbbr(str) {
  if (!str) return '';
  // 简化版：只取汉字首字母（这里用简单映射）
  const pinyinMap = {
    '血': 'X', '细': 'X', '胞': 'B', '分': 'F', '析': 'X',
    '儿': 'E', '科': 'K', '反': 'F', '应': 'Y', '蛋': 'D', '白': 'B',
    '清': 'Q', '淀': 'D', '粉': 'F', '样': 'Y', '红': 'H',
    '沉': 'C', '降': 'J', '率': 'L', '疟': 'N', '原': 'Y', '虫': 'C', '检': 'J', '查': 'C',
    '凝': 'N', '酶': 'M', '时': 'S', '间': 'J', '活': 'H', '化': 'H',
    '部': 'B', '酶': 'M', '纤': 'X', '维': 'W', '抗': 'K',
    '产': 'C', '物': 'W', '二': 'E', '聚': 'J', '体': 'T',
    '总': 'Z', '蛋': 'D', '乳': 'R', '酸': 'S', '脱': 'T', '氢': 'Q',
    '碱': 'J', '性': 'X', '磷': 'L', '丙': 'B', '氨': 'A', '基': 'J', '转': 'Z', '移': 'Y',
    '天': 'T', '门': 'M', '冬': 'D', '谷': 'G', '胆': 'D', '素': 'S',
    '结': 'J', '合': 'H', '未': 'W', '酯': 'Z', '肌': 'J', '酐': 'G',
    '尿': 'N', '钾': 'J', '钠': 'N', '氯': 'L', '碳': 'T', '盐': 'Y',
    '钙': 'G', '镁': 'M', '葡': 'P', '萄': 'T', '糖': 'T', '氨': 'A',
    '脂': 'Z', '肪': 'F', '高': 'G', '密': 'M', '度': 'D', '固': 'G', '醇': 'C',
    '低': 'D', '油': 'Y', '三': 'S', '钙': 'G', '蛋': 'D',
    '肌': 'J', '钙': 'G', '红': 'H', '促': 'C', '肾': 'S', '上': 'S', '腺': 'X', '皮': 'P', '质': 'Z', '激': 'J',
    '介': 'J', '降': 'J', '钠': 'N', '肽': 'T', '前': 'Q',
    '肠': 'C', '道': 'D', '病': 'B', '毒': 'D', '肺': 'F', '炎': 'Y', '支': 'Z', '衣': 'Y',
    '柯': 'K', '萨': 'S', '奇': 'Q', '腺': 'X', '呼': 'H', '吸': 'X', '胞': 'B', '新': 'X', '型': 'X', '冠': 'G', '状': 'Z',
    '肝': 'G', '可': 'K', '溶': 'R', '长': 'C', '刺': 'C', '表': 'B', '达': 'D',
    '中': 'Z', '粒': 'L', '明': 'M', '胶': 'J', '相': 'X', '关': 'G', '载': 'Z',
    '气': 'Q', '氧': 'Y', '液': 'Y', '妊': 'R', '娠': 'S', '试': 'S', '验': 'Y',
    '粪': 'F', '便': 'B', '常': 'C', '规': 'G', '隐': 'Y', '铁': 'T',
    '轮': 'L', '甲': 'J', '乙': 'Y', '流': 'L', '感': 'G', '核': 'H',
    '腹': 'F', '水': 'S', '胸': 'X', '脑': 'N', '脊': 'J'
  };
  
  let abbr = '';
  for (const char of str) {
    if (pinyinMap[char]) {
      abbr += pinyinMap[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      abbr += char.toUpperCase();
    }
  }
  return abbr.substring(0, 20); // 限制长度
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }

  // 解析连接字符串
  const url = new URL(dbUrl);
  const connection = await createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connected to database');

  // 读取 CSV 文件
  const csvContent = readFileSync('/home/ubuntu/jianyan_system/seed/seed_all.csv', 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  console.log(`Parsed ${records.length} records from CSV`);

  // 先创建一个草稿版本
  const [versionResult] = await connection.execute(
    `INSERT INTO versions (versionCode, status, summary, changelog) VALUES (?, ?, ?, ?)`,
    ['1.0.0', 'draft', '初始导入急诊项目数据', '从采集手册导入急诊检验项目']
  );
  const versionId = versionResult.insertId;
  console.log(`Created version with ID: ${versionId}`);

  // 导入数据
  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      const itemId = record['项目ID'] || '';
      const itemName = record['项目名称'] || '';
      const itemGroup = record['检验项目组套'] || '';
      const specimenType = record['样本类型'] || '血清';
      const containerType = record['标本容器'] || '';
      const tubeColor = record['推荐管色'] || '';
      const tubeAdditive = record['添加剂'] || '';
      const recommendedVolume = record['采样量'] || '';
      const collectionRequirements = record['采集要求原文'] || '';
      const reportTimeStr = record['报告时间(结构化json)'] || '{}';
      const needsConfirmation = record['需人工确认'] === '是';

      if (!itemId || !itemName) {
        console.log(`Skipping record with missing itemId or itemName`);
        errorCount++;
        continue;
      }

      // 解析报告时间
      let reportTime = {};
      try {
        reportTime = JSON.parse(reportTimeStr);
      } catch (e) {
        reportTime = { "报告时间": reportTimeStr };
      }

      // 生成拼音首字母
      const pinyinAbbr = getPinyinAbbr(itemName);

      // 确定场景标签
      let scenarioTags = [];
      if (itemGroup && itemGroup.includes('急诊')) {
        scenarioTags.push('急诊');
      }
      if (reportTime['门诊']) {
        scenarioTags.push('门诊');
      }
      if (reportTime['病房']) {
        scenarioTags.push('病房');
      }
      if (scenarioTags.length === 0) {
        scenarioTags = ['常规'];
      }

      await connection.execute(
        `INSERT INTO items (
          itemId, itemName, itemGroup, specimenType, containerType, 
          tubeColor, tubeAdditive, recommendedVolume, collectionRequirements, 
          reportTime, needsConfirmation, pinyinAbbr, scenarioTags, versionId, enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          itemName = VALUES(itemName),
          itemGroup = VALUES(itemGroup),
          specimenType = VALUES(specimenType),
          containerType = VALUES(containerType),
          tubeColor = VALUES(tubeColor),
          tubeAdditive = VALUES(tubeAdditive),
          recommendedVolume = VALUES(recommendedVolume),
          collectionRequirements = VALUES(collectionRequirements),
          reportTime = VALUES(reportTime),
          needsConfirmation = VALUES(needsConfirmation),
          pinyinAbbr = VALUES(pinyinAbbr),
          scenarioTags = VALUES(scenarioTags),
          versionId = VALUES(versionId)`,
        [
          itemId, itemName, itemGroup, specimenType, containerType,
          tubeColor, tubeAdditive, recommendedVolume, collectionRequirements,
          JSON.stringify(reportTime), needsConfirmation, pinyinAbbr, 
          JSON.stringify(scenarioTags), versionId, true
        ]
      );
      successCount++;
    } catch (err) {
      console.error(`Error importing record:`, err.message);
      errorCount++;
    }
  }

  // 更新版本统计
  await connection.execute(
    `UPDATE versions SET addedCount = ?, status = 'draft' WHERE id = ?`,
    [successCount, versionId]
  );

  console.log(`\nImport completed:`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  Version ID: ${versionId}`);

  await connection.end();
}

main().catch(console.error);
