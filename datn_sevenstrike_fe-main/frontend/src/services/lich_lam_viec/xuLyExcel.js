import * as XLSX from "xlsx";

/**
 * Tạo template Excel cho import lịch làm việc
 * @returns {void}
 */
export const downloadScheduleTemplate = () => {
  const data = [
    {
      "STT": 1,
      "Ca Làm": "Ca sáng",
      "Ngày Làm": "2026-03-05",
      "Nhân Viên 1": "Nguyễn Văn A",
      "Nhân Viên 2": "Trần Thị B",
      "Ghi Chú": "Lưu ý gì nếu có"
    },
    {
      "STT": 2,
      "Ca Làm": "Ca chiều",
      "Ngày Làm": "2026-03-05",
      "Nhân Viên 1": "Lê Văn C",
      "Nhân Viên 2": "",
      "Ghi Chú": ""
    },
    {
      "STT": 3,
      "Ca Làm": "Ca tối",
      "Ngày Làm": "2026-03-06",
      "Nhân Viên 1": "Phạm Văn D, Hoàng Thị E",
      "Nhân Viên 2": "",
      "Ghi Chú": "Có thể viết nhiều nhân viên cách nhau bằng dấu phẩy"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  
  // Đặt độ rộng cho các cột
  ws['!cols'] = [
    { wch: 5 },   // STT
    { wch: 15 },  // Ca Làm
    { wch: 15 },  // Ngày Làm
    { wch: 20 },  // Nhân Viên 1
    { wch: 20 },  // Nhân Viên 2
    { wch: 30 }   // Ghi Chú
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Lịch Làm Việc");
  
  // Tạo instruction sheet
  const instructions = [
    {
      "Hướng Dẫn": "Hướng dẫn import lịch làm việc"
    },
    {
      "Hướng Dẫn": ""
    },
    {
      "Hướng Dẫn": "1. Ca Làm: Nhập tên ca làm (ví dụ: Ca sáng, Ca chiều, Ca tối) hoặc ID của ca"
    },
    {
      "Hướng Dẫn": "2. Ngày Làm: Nhập ngày dạng YYYY-MM-DD (ví dụ: 2026-03-05)"
    },
    {
      "Hướng Dẫn": "3. Nhân Viên: Nhập tên hoặc mã nhân viên"
    },
    {
      "Hướng Dẫn": "   - Có thể nhập nhiều nhân viên trong một ô, cách nhau bằng dấu phẩy (,) hoặc dấu chấm phẩy (;)"
    },
    {
      "Hướng Dẫn": "   - Hoặc nhập từng nhân viên vào các ô riêng (Nhân Viên 1, Nhân Viên 2, ...)"
    },
    {
      "Hướng Dẫn": "4. Ngày Làm chỉ được nhập một lần per dòng (một lịch làm việc)"
    },
    {
      "Hướng Dẫn": "5. Nếu ca làm đó đã có lịch vào ngày đó, sẽ nhập thất bại"
    }
  ];

  const wsInstructions = XLSX.utils.json_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 100 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, "Hướng Dẫn");

  XLSX.writeFile(wb, `lich_lam_viec_template_${new Date().getTime()}.xlsx`);
};

/**
 * Parse file Excel thành dữ liệu JSON để preview
 * @param {File} file - File Excel
 * @returns {Promise<Array>} - Array chứa dữ liệu các dòng
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Vui lòng chọn file"));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        
        if (rows.length === 0) {
          reject(new Error("File Excel không có dữ liệu"));
          return;
        }

        // Transform data để dễ preview
        const transformedData = rows.map((row, index) => ({
          rowNum: index + 2, // +2 vì bỏ header (row 1) và 1-indexed
          ...row
        }));

        resolve(transformedData);
      } catch (error) {
        reject(new Error("Lỗi khi đọc file Excel: " + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Không thể đọc file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validate dữ liệu trước khi import
 * @param {Array} data - Dữ liệu để validate
 * @param {Array} listCa - Danh sách các ca làm
 * @param {Array} listNhanVien - Danh sách nhân viên
 * @returns {Object} - {valid: boolean, errors: Array, warnings: Array}
 */
// excelScheduleService.js

export const validateScheduleData = (data, listCa, listNhanVien) => {
  const errors = [];
  const warnings = [];

  data.forEach((row, index) => {
    const rowNum = index + 2; // Dòng trong Excel
    let ngayLam = row['Ngày Làm'];

    // 1. Chuyển đổi mọi định dạng về String YYYY-MM-DD để kiểm tra
    if (ngayLam instanceof Date) {
      ngayLam = ngayLam.toISOString().split('T')[0];
    } else if (typeof ngayLam === 'number') {
      // Xử lý số serial của Excel (ví dụ 45352)
      const date = new Date(Math.round((ngayLam - 25569) * 864e5));
      ngayLam = date.toISOString().split('T')[0];
    }

    // 2. Regex kiểm tra format
    const regexISO = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    const regexVN = /^\d{1,2}\/\d{1,2}\/\d{4}$/; // DD/MM/YYYY

    if (!ngayLam) {
      errors.push(`Dòng ${rowNum}: Ngày Làm không được để trống`);
    } else if (!regexISO.test(ngayLam) && !regexVN.test(ngayLam)) {
      errors.push(`Dòng ${rowNum}: Ngày Làm (${ngayLam}) không đúng format (YYYY-MM-DD hoặc DD/MM/YYYY)`);
    }

    // Kiểm tra Ca Làm
    if (!row['Ca Làm']) {
      errors.push(`Dòng ${rowNum}: Thiếu thông tin Ca Làm`);
    }
  });

  return { errors, warnings };
};

/**
 * Kiểm tra xem chuỗi có phải là ngày hợp lệ không
 */
function isValidDate(dateString) {
  // Kiểm tra format YYYY-MM-DD
  const regex1 = /^\d{4}-\d{2}-\d{2}$/;
  if (regex1.test(dateString)) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  // Kiểm tra format DD/MM/YYYY
  const regex2 = /^\d{2}\/\d{2}\/\d{4}$/;
  if (regex2.test(dateString)) {
    const [day, month, year] = dateString.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    return date instanceof Date && !isNaN(date);
  }

  return false;
}

/**
 * Format dữ liệu để hiển thị trong preview
 */
export const formatDataForPreview = (data) => {
  return data.map(row => ({
    ...row,
    displayText: `Dòng ${row.rowNum}: ${Object.values(row).slice(1).join(" | ")}`
  }));
};
