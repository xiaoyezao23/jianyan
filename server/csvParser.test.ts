import { describe, expect, it } from "vitest";
import { parseCSV, processCSVImport, generateFailedDetailCSV } from "./csvParser";

describe("parseCSV", () => {
  it("should parse simple CSV content", () => {
    const content = `项目ID,项目名称,样本类型
LAB000001,血细胞分析,全血
LAB000002,C-反应蛋白,血清`;
    
    const result = parseCSV(content);
    
    expect(result.headers).toEqual(["项目ID", "项目名称", "样本类型"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(["LAB000001", "血细胞分析", "全血"]);
    expect(result.rows[1]).toEqual(["LAB000002", "C-反应蛋白", "血清"]);
  });

  it("should handle CSV with quoted fields", () => {
    const content = `项目ID,项目名称,报告时间
LAB000001,血细胞分析,"{""门诊"": ""30分钟""}"`;
    
    const result = parseCSV(content);
    
    expect(result.rows[0][2]).toContain("门诊");
  });

  it("should handle BOM character", () => {
    const content = `\uFEFF项目ID,项目名称
LAB000001,测试`;
    
    const result = parseCSV(content);
    
    expect(result.headers[0]).toBe("项目ID");
  });

  it("should handle empty content", () => {
    const result = parseCSV("");
    
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });
});

describe("processCSVImport", () => {
  it("should validate required fields", () => {
    const content = `项目ID,项目名称,样本类型
LAB000001,血细胞分析,全血
,缺少ID,血清
LAB000003,,血浆`;
    
    const report = processCSVImport(content, "test.csv");
    
    expect(report.totalRows).toBe(3);
    expect(report.successRows).toBe(1);
    expect(report.failedRows).toBe(2);
    expect(report.errorSummary.some(e => e.code === "E_ID_EMPTY")).toBe(true);
    expect(report.errorSummary.some(e => e.code === "E_NAME_EMPTY")).toBe(true);
  });

  it("should generate warnings for missing optional fields", () => {
    const content = `项目ID,项目名称,样本类型,推荐管色
LAB000001,血细胞分析,全血,紫`;
    
    const report = processCSVImport(content, "test.csv");
    
    expect(report.successRows).toBe(1);
    expect(report.warningRows).toBe(1);
    expect(report.warningSummary.some(w => w.code === "W_TEMP_EMPTY")).toBe(true);
  });

  it("should handle OVERWRITE_BY_ID strategy", () => {
    const content = `项目ID,项目名称,样本类型
LAB000001,第一条,全血
LAB000001,第二条,血清`;
    
    const report = processCSVImport(content, "test.csv", "OVERWRITE_BY_ID");
    
    expect(report.successRows).toBe(1);
    expect(report.successData[0].itemName).toBe("第二条");
  });

  it("should handle SKIP_BY_ID strategy", () => {
    const content = `项目ID,项目名称,样本类型
LAB000001,第一条,全血
LAB000001,第二条,血清`;
    
    const report = processCSVImport(content, "test.csv", "SKIP_BY_ID");
    
    expect(report.successRows).toBe(1);
    expect(report.failedRows).toBe(1);
  });

  it("should generate correct import ID format", () => {
    const content = `项目ID,项目名称,样本类型
LAB000001,测试,全血`;
    
    const report = processCSVImport(content, "test.csv");
    
    expect(report.importId).toMatch(/^IMP_\d{8}_\d{6}$/);
  });

  it("should map Chinese column names correctly", () => {
    const content = `项目ID,项目名称,样本类型,推荐管色,添加剂,采样量
LAB000001,血细胞分析,全血,紫,EDTA-K2,2mL`;
    
    const report = processCSVImport(content, "test.csv");
    
    expect(report.successRows).toBe(1);
    const item = report.successData[0];
    expect(item.itemId).toBe("LAB000001");
    expect(item.itemName).toBe("血细胞分析");
    expect(item.specimenType).toBe("全血");
    expect(item.tubeColor).toBe("紫");
    expect(item.tubeAdditive).toBe("EDTA-K2");
    expect(item.recommendedVolume).toBe("2mL");
  });

  it("should parse needsConfirmation field correctly", () => {
    const content = `项目ID,项目名称,样本类型,需人工确认
LAB000001,测试1,全血,是
LAB000002,测试2,血清,否`;
    
    const report = processCSVImport(content, "test.csv");
    
    expect(report.successData[0].needsConfirmation).toBe(true);
    expect(report.successData[1].needsConfirmation).toBe(false);
  });
});

describe("generateFailedDetailCSV", () => {
  it("should generate CSV with failed details", () => {
    const failedDetails = [
      {
        rowNo: 2,
        itemId: "",
        itemName: "测试项目",
        isValid: false,
        errors: [{ code: "E_ID_EMPTY", field: "itemId", message: "项目ID为空" }],
        warnings: [],
      },
    ];
    
    const csv = generateFailedDetailCSV(failedDetails);
    
    expect(csv).toContain("row_no,item_id,item_name,error_codes,error_fields,message");
    expect(csv).toContain("2");
    expect(csv).toContain("E_ID_EMPTY");
    expect(csv).toContain("项目ID为空");
  });

  it("should handle multiple errors in one row", () => {
    const failedDetails = [
      {
        rowNo: 3,
        itemId: "",
        itemName: "",
        isValid: false,
        errors: [
          { code: "E_ID_EMPTY", field: "itemId", message: "项目ID为空" },
          { code: "E_NAME_EMPTY", field: "itemName", message: "项目名称为空" },
        ],
        warnings: [],
      },
    ];
    
    const csv = generateFailedDetailCSV(failedDetails);
    
    expect(csv).toContain("E_ID_EMPTY;E_NAME_EMPTY");
  });
});
