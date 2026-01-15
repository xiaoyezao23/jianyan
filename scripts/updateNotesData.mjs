import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 加载注意事项数据
const notesData = JSON.parse(readFileSync('/home/ubuntu/jianyan_system/seed/collection_notes.json', 'utf-8'));

// 根据样本类型获取注意事项
function getSpecimenNotes(specimenType) {
  if (!specimenType) return {};
  
  // 匹配样本类型
  if (specimenType.includes('血清') || specimenType.includes('血浆') || specimenType.includes('全血')) {
    return notesData.specimenTypeNotes['血液'] || {};
  }
  if (specimenType.includes('尿')) {
    return notesData.specimenTypeNotes['尿液'] || {};
  }
  if (specimenType.includes('粪便') || specimenType.includes('大便')) {
    return notesData.specimenTypeNotes['粪便'] || {};
  }
  if (specimenType.includes('脑脊液')) {
    return notesData.specimenTypeNotes['脑脊液'] || {};
  }
  if (specimenType.includes('培养')) {
    return notesData.specimenTypeNotes['血培养'] || {};
  }
  
  return notesData.specimenTypeNotes['血液'] || {}; // 默认血液
}

// 根据管色获取注意事项
function getTubeNotes(tubeColor) {
  if (!tubeColor) return {};
  
  const colorMap = {
    '红': '红管',
    '紫': '紫管',
    '蓝': '蓝管',
    '绿': '绿管',
    '黄': '黄管',
    '灰': '灰管',
    '黑': '黑管'
  };
  
  for (const [key, value] of Object.entries(colorMap)) {
    if (tubeColor.includes(key)) {
      return notesData.tubeColorNotes[value] || {};
    }
  }
  
  return {};
}

// 根据项目组获取注意事项
function getGroupNotes(itemName, itemGroup) {
  if (!itemName && !itemGroup) return {};
  
  const combined = (itemName || '') + (itemGroup || '');
  
  // 匹配项目组
  if (combined.includes('肝功') || combined.includes('肾功') || combined.includes('转氨酶') || combined.includes('胆红素')) {
    return notesData.projectGroupNotes['肝肾功能'] || {};
  }
  if (combined.includes('血糖') || combined.includes('葡萄糖')) {
    return notesData.projectGroupNotes['血糖检测'] || {};
  }
  if (combined.includes('OGTT') || combined.includes('糖耐量')) {
    return notesData.projectGroupNotes['OGTT'] || {};
  }
  if (combined.includes('血脂') || combined.includes('胆固醇') || combined.includes('甘油三酯')) {
    return notesData.projectGroupNotes['血脂检测'] || {};
  }
  if (combined.includes('凝血') || combined.includes('PT') || combined.includes('APTT') || combined.includes('纤维蛋白')) {
    return notesData.projectGroupNotes['凝血功能'] || {};
  }
  if (combined.includes('甲状腺') || combined.includes('TSH') || combined.includes('T3') || combined.includes('T4')) {
    return notesData.projectGroupNotes['甲状腺功能'] || {};
  }
  if (combined.includes('皮质醇')) {
    return notesData.projectGroupNotes['皮质醇'] || {};
  }
  if (combined.includes('醛固酮')) {
    return notesData.projectGroupNotes['醛固酮'] || {};
  }
  if (combined.includes('DNA') || combined.includes('RNA') || combined.includes('核酸') || combined.includes('基因')) {
    return notesData.projectGroupNotes['分子诊断'] || {};
  }
  if (combined.includes('培养') || combined.includes('微生物')) {
    return notesData.projectGroupNotes['微生物培养'] || {};
  }
  
  return {};
}

// 合并注意事项，优先级：项目组 > 管色 > 样本类型
function mergeNotes(specimenNotes, tubeNotes, groupNotes) {
  return {
    fastingRequirement: groupNotes.fastingRequirement || tubeNotes.fastingRequirement || specimenNotes.fastingRequirement || null,
    dietaryRestrictions: groupNotes.dietaryRestrictions || tubeNotes.dietaryRestrictions || specimenNotes.dietaryRestrictions || null,
    medicationNotes: groupNotes.medicationNotes || tubeNotes.medicationNotes || specimenNotes.medicationNotes || null,
    positionRequirement: groupNotes.positionRequirement || tubeNotes.positionRequirement || specimenNotes.positionRequirement || null,
    collectionSequence: groupNotes.collectionSequence || tubeNotes.collectionSequence || specimenNotes.collectionSequence || null,
    collectionTiming: groupNotes.collectionTiming || tubeNotes.collectionTiming || specimenNotes.collectionTiming || null,
    operationNotes: groupNotes.operationNotes || tubeNotes.operationNotes || specimenNotes.operationNotes || null,
    storageLimit: groupNotes.storageLimit || tubeNotes.storageLimit || specimenNotes.storageLimit || null,
    specialRequirements: groupNotes.specialRequirements || tubeNotes.specialRequirements || specimenNotes.specialRequirements || null,
    rejectionDetails: groupNotes.rejectionDetails || tubeNotes.rejectionDetails || specimenNotes.rejectionDetails || null
  };
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

  // 获取所有项目
  const [items] = await connection.execute('SELECT id, itemId, itemName, itemGroup, specimenType, tubeColor FROM items');
  console.log(`Found ${items.length} items to update`);

  let updateCount = 0;
  let errorCount = 0;

  for (const item of items) {
    try {
      // 获取各类注意事项
      const specimenNotes = getSpecimenNotes(item.specimenType);
      const tubeNotes = getTubeNotes(item.tubeColor);
      const groupNotes = getGroupNotes(item.itemName, item.itemGroup);
      
      // 合并注意事项
      const notes = mergeNotes(specimenNotes, tubeNotes, groupNotes);
      
      // 更新数据库
      await connection.execute(
        `UPDATE items SET 
          fastingRequirement = ?,
          dietaryRestrictions = ?,
          medicationNotes = ?,
          positionRequirement = ?,
          collectionSequence = ?,
          collectionTiming = ?,
          operationNotes = ?,
          storageLimit = ?,
          specialRequirements = ?,
          rejectionDetails = ?
        WHERE id = ?`,
        [
          notes.fastingRequirement,
          notes.dietaryRestrictions,
          notes.medicationNotes,
          notes.positionRequirement,
          notes.collectionSequence,
          notes.collectionTiming,
          notes.operationNotes,
          notes.storageLimit,
          notes.specialRequirements,
          notes.rejectionDetails ? JSON.stringify(notes.rejectionDetails) : null,
          item.id
        ]
      );
      
      updateCount++;
      if (updateCount % 100 === 0) {
        console.log(`Updated ${updateCount} items...`);
      }
    } catch (err) {
      console.error(`Error updating item ${item.itemId}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\nUpdate completed:`);
  console.log(`  Updated: ${updateCount}`);
  console.log(`  Errors: ${errorCount}`);

  await connection.end();
}

main().catch(console.error);
