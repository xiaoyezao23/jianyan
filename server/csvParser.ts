import { InsertItem } from "../drizzle/schema";

// 枚举值定义
const ENUMS = {
  specimen_type: ["全血", "血清", "血浆", "尿液", "粪便", "脑脊液", "胸水", "腹水", "拭子", "痰液", "分泌物", "骨髓", "胸腹水", "其他"],
  container_type: ["真空采血管", "尿沉渣管", "无菌尿杯", "便盒", "15ml离心管", "玻璃管", "病毒核酸采样管", "一次性咽拭子", "需氧/厌氧微生物培养瓶", "EP管", "血气专用采血针", "无菌管", "无菌拭子", "游离核酸保存管", "其他"],
  tube_color: ["紫", "蓝", "绿", "灰", "红", "黄", "橙", "橘", "其他"],
  tube_additive: ["EDTA-K2", "枸橼酸钠", "肝素锂", "肝素钠", "分离胶", "促凝剂", "氟化钠", "无", "其他"],
  blood_specimen_types: ["全血", "血清", "血浆"],
  non_blood_specimen_types: ["尿液", "粪便", "拭子", "痰液", "分泌物"]
};

// 列名映射
const COLUMN_MAPPING: Record<string, string> = {
  "项目ID": "itemId",
  "item_id": "itemId",
  "项目名称": "itemName",
  "item_name": "itemName",
  "检验项目组套": "itemGroup",
  "item_group": "itemGroup",
  "样本类型": "specimenType",
  "specimen_type": "specimenType",
  "标本容器": "containerType",
  "container_type": "containerType",
  "推荐管色": "tubeColor",
  "tube_color": "tubeColor",
  "添加剂": "tubeAdditive",
  "tube_additive": "tubeAdditive",
  "采样量": "recommendedVolume",
  "recommended_volume": "recommendedVolume",
  "采集要求原文": "collectionRequirements",
  "collection_requirements": "collectionRequirements",
  "报告时间(结构化json)": "reportTime",
  "report_time": "reportTime",
  "需人工确认": "needsConfirmation",
  "needs_confirmation": "needsConfirmation",
  "别名": "alias",
  "英文缩写": "enAbbr",
  "en_abbr": "enAbbr",
  "拼音首字母": "pinyinAbbr",
  "pinyin_abbr": "pinyinAbbr",
  "场景标签": "scenarioTags",
  "scenario_tags": "scenarioTags",
  "保存温度": "storageTemp",
  "storage_temp": "storageTemp",
  "转运时限": "transportLimit",
  "transport_limit": "transportLimit",
  "特殊处理摘要": "handlingSummary",
  "handling_summary": "handlingSummary",
  "拒收标准": "rejectionSummary",
  "rejection_summary": "rejectionSummary",
  "患者准备摘要": "prepSummary",
  "prep_summary": "prepSummary",
  "是否启用": "enabled",
  "enabled": "enabled"
};

export interface ValidationError {
  code: string;
  field: string;
  message: string;
}

export interface ValidationWarning {
  code: string;
  field: string;
  message: string;
}

export interface RowValidationResult {
  rowNo: number;
  itemId: string;
  itemName: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  data?: InsertItem;
}

export interface ImportReport {
  importId: string;
  fileName: string;
  versionTarget: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  warningRows: number;
  conflictStrategy: string;
  errorSummary: { code: string; count: number }[];
  warningSummary: { code: string; count: number }[];
  failedDetails: RowValidationResult[];
  successData: InsertItem[];
}

// 生成拼音首字母
function generatePinyinAbbr(name: string): string {
  // 简单实现：取每个汉字的首字母（这里只是占位，实际需要拼音库）
  // 对于MVP，我们暂时不实现完整的拼音转换
  return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
}

// 解析 CSV 行
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// 解析 CSV 内容
export function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  // 移除 BOM
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }
  
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => parseCSVLine(line));
  
  return { headers, rows };
}

// 映射列名
function mapColumnName(header: string): string {
  const trimmed = header.trim();
  return COLUMN_MAPPING[trimmed] || trimmed;
}

// 校验单行数据
function validateRow(rowNo: number, data: Record<string, string>): RowValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  const itemId = data.itemId?.trim() || '';
  const itemName = data.itemName?.trim() || '';
  const specimenType = data.specimenType?.trim() || '';
  const tubeColor = data.tubeColor?.trim() || '';
  const containerType = data.containerType?.trim() || '';
  const tubeAdditive = data.tubeAdditive?.trim() || '';
  
  // 强校验
  if (!itemId) {
    errors.push({ code: "E_ID_EMPTY", field: "itemId", message: "项目ID为空" });
  } else if (!/^LAB\d{6}$/.test(itemId)) {
    // 放宽校验，只警告
    warnings.push({ code: "W_ID_FORMAT", field: "itemId", message: "项目ID格式建议为LAB+6位数字" });
  }
  
  if (!itemName) {
    errors.push({ code: "E_NAME_EMPTY", field: "itemName", message: "项目名称为空" });
  } else if (itemName.length > 200) {
    errors.push({ code: "E_NAME_INVALID", field: "itemName", message: "项目名称超过200字符" });
  }
  
  if (!specimenType) {
    errors.push({ code: "E_SPECIMEN_EMPTY", field: "specimenType", message: "样本类型为空" });
  } else if (!ENUMS.specimen_type.includes(specimenType)) {
    warnings.push({ code: "W_SPECIMEN_INVALID", field: "specimenType", message: `样本类型"${specimenType}"不在标准枚举中` });
  }
  
  // 血液样本必须有管色
  if (ENUMS.blood_specimen_types.includes(specimenType) && !tubeColor) {
    warnings.push({ code: "W_TUBE_COLOR_REQUIRED", field: "tubeColor", message: "血液样本建议填写管色" });
  }
  
  // 非血液样本必须有容器类型
  if (ENUMS.non_blood_specimen_types.includes(specimenType) && !containerType) {
    warnings.push({ code: "W_CONTAINER_REQUIRED", field: "containerType", message: "非血液样本建议填写容器类型" });
  }
  
  // 管色和添加剂联动校验
  if (tubeColor && tubeAdditive) {
    const tubeAdditiveMapping: Record<string, string[]> = {
      "紫": ["EDTA-K2"],
      "蓝": ["枸橼酸钠"],
      "绿": ["肝素锂", "肝素钠"],
      "灰": ["氟化钠"],
      "红": ["促凝剂", "无", "分离胶"],
      "黄": ["分离胶", "促凝剂"]
    };
    
    const expectedAdditives = tubeAdditiveMapping[tubeColor];
    if (expectedAdditives && !expectedAdditives.includes(tubeAdditive)) {
      warnings.push({ 
        code: "W_TUBE_ADD_MISMATCH", 
        field: "tubeAdditive", 
        message: `${tubeColor}管通常使用${expectedAdditives.join('/')}，当前为${tubeAdditive}` 
      });
    }
  }
  
  // 弱校验
  if (!data.transportLimit?.trim()) {
    warnings.push({ code: "W_LIMIT_EMPTY", field: "transportLimit", message: "转运时限为空" });
  }
  
  if (!data.storageTemp?.trim()) {
    warnings.push({ code: "W_TEMP_EMPTY", field: "storageTemp", message: "保存温度为空" });
  }
  
  if (!data.rejectionSummary?.trim()) {
    warnings.push({ code: "W_REJECT_EMPTY", field: "rejectionSummary", message: "拒收标准为空" });
  }
  
  const isValid = errors.length === 0;
  
  let insertData: InsertItem | undefined;
  if (isValid) {
    // 解析 reportTime JSON
    let reportTime = null;
    if (data.reportTime) {
      try {
        reportTime = JSON.parse(data.reportTime);
      } catch {
        reportTime = { raw: data.reportTime };
      }
    }
    
    // 解析 needsConfirmation
    const needsConfirmation = data.needsConfirmation === '是' || data.needsConfirmation === 'true' || data.needsConfirmation === '1';
    
    // 解析 enabled
    let enabled = true;
    if (data.enabled !== undefined && data.enabled !== '') {
      enabled = data.enabled === '是' || data.enabled === 'true' || data.enabled === '1';
    }
    
    insertData = {
      itemId,
      itemName,
      itemGroup: data.itemGroup?.trim() || null,
      specimenType,
      containerType: containerType || null,
      tubeColor: tubeColor || null,
      tubeAdditive: tubeAdditive || null,
      recommendedVolume: data.recommendedVolume?.trim() || null,
      collectionRequirements: data.collectionRequirements?.trim() || null,
      reportTime,
      needsConfirmation,
      alias: data.alias?.trim() || null,
      enAbbr: data.enAbbr?.trim() || null,
      pinyinAbbr: data.pinyinAbbr?.trim() || generatePinyinAbbr(itemName),
      scenarioTags: data.scenarioTags ? JSON.parse(data.scenarioTags) : null,
      storageTemp: data.storageTemp?.trim() || null,
      transportLimit: data.transportLimit?.trim() || null,
      handlingSummary: data.handlingSummary?.trim() || null,
      rejectionSummary: data.rejectionSummary?.trim() || null,
      prepSummary: data.prepSummary?.trim() || null,
      enabled,
    };
  }
  
  return {
    rowNo,
    itemId,
    itemName,
    isValid,
    errors,
    warnings,
    data: insertData
  };
}

// 处理 CSV 导入
export function processCSVImport(
  content: string, 
  fileName: string, 
  conflictStrategy: "OVERWRITE_BY_ID" | "SKIP_BY_ID" | "ERROR_BY_ID" = "OVERWRITE_BY_ID"
): ImportReport {
  const { headers, rows } = parseCSV(content);
  
  // 映射列名
  const mappedHeaders = headers.map(mapColumnName);
  
  const results: RowValidationResult[] = [];
  const successData: InsertItem[] = [];
  const errorCounts: Record<string, number> = {};
  const warningCounts: Record<string, number> = {};
  const seenItemIds = new Set<string>();
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowData: Record<string, string> = {};
    
    for (let j = 0; j < mappedHeaders.length; j++) {
      rowData[mappedHeaders[j]] = row[j] || '';
    }
    
    const result = validateRow(i + 2, rowData); // +2 因为第1行是表头，行号从1开始
    
    // 检查重复ID
    if (result.itemId && seenItemIds.has(result.itemId)) {
      if (conflictStrategy === "ERROR_BY_ID") {
        result.isValid = false;
        result.errors.push({ 
          code: "E_ID_DUPLICATE", 
          field: "itemId", 
          message: `项目ID ${result.itemId} 在文件中重复` 
        });
      } else if (conflictStrategy === "SKIP_BY_ID") {
        result.isValid = false;
        result.errors.push({ 
          code: "E_ID_SKIPPED", 
          field: "itemId", 
          message: `项目ID ${result.itemId} 重复，已跳过` 
        });
      }
      // OVERWRITE_BY_ID: 后面的覆盖前面的
    }
    
    if (result.itemId) {
      seenItemIds.add(result.itemId);
    }
    
    // 统计错误和警告
    for (const error of result.errors) {
      errorCounts[error.code] = (errorCounts[error.code] || 0) + 1;
    }
    for (const warning of result.warnings) {
      warningCounts[warning.code] = (warningCounts[warning.code] || 0) + 1;
    }
    
    results.push(result);
    
    if (result.isValid && result.data) {
      // 对于 OVERWRITE_BY_ID，移除之前的同ID数据
      if (conflictStrategy === "OVERWRITE_BY_ID") {
        const existingIndex = successData.findIndex(d => d.itemId === result.data!.itemId);
        if (existingIndex >= 0) {
          successData.splice(existingIndex, 1);
        }
      }
      successData.push(result.data);
    }
  }
  
  const failedDetails = results.filter(r => !r.isValid);
  const warningRows = results.filter(r => r.isValid && r.warnings.length > 0).length;
  
  // 生成导入ID
  const now = new Date();
  const importId = `IMP_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  
  return {
    importId,
    fileName,
    versionTarget: "draft",
    totalRows: rows.length,
    successRows: successData.length,
    failedRows: failedDetails.length,
    warningRows,
    conflictStrategy,
    errorSummary: Object.entries(errorCounts).map(([code, count]) => ({ code, count })),
    warningSummary: Object.entries(warningCounts).map(([code, count]) => ({ code, count })),
    failedDetails,
    successData
  };
}

// 生成失败明细 CSV
export function generateFailedDetailCSV(failedDetails: RowValidationResult[]): string {
  const headers = ["row_no", "item_id", "item_name", "error_codes", "error_fields", "message"];
  const lines = [headers.join(",")];
  
  for (const detail of failedDetails) {
    const errorCodes = detail.errors.map(e => e.code).join(";");
    const errorFields = detail.errors.map(e => e.field).join(";");
    const messages = detail.errors.map(e => e.message).join("; ");
    
    lines.push([
      detail.rowNo,
      `"${detail.itemId}"`,
      `"${detail.itemName}"`,
      `"${errorCodes}"`,
      `"${errorFields}"`,
      `"${messages}"`
    ].join(","));
  }
  
  return lines.join("\n");
}
