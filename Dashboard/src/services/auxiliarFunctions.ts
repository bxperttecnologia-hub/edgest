const ignoreWords = ["ao", "de", "para", "e", "&"];

const normalize = str =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const course_sigla = (name = "") => {
  if (!name.trim()) return "";

  return normalize(name)
    .split(/\s+/)
    .filter(w => !["ao", "de", "para", "e"].includes(w.toLowerCase()))
    .map(w => w[0].toUpperCase())
    .join("");
};



const formatValue = (value) => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const leadingZero = (num, places) => String(num).padStart(places, "0");

function isDate(value) {
  return (
    Object.prototype.toString.call(value) === "[object Date]" ||
    (!isNaN(Date.parse(value)) &&
      typeof value === "string" &&
      value.includes("-"))
  );
}

const isExcelDate = (val) => {
  return typeof val === "number" && val > 20000 && val < 60000; // intervalo aproximado para anos entre 1950 e 2100
};

const excelDateToString = (serial) => {
  const excelEpoch = new Date(1899, 11, 30); // Excel começa em 1900-01-01, mas precisa compensar bug do ano bissexto
  const date = new Date(excelEpoch.getTime() + serial * 86400000); // 86400000 ms em 1 dia
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

const formatTimeForInput = (timeStr) => {
  if (!timeStr) return "";
  // Assume que a entrada é "HH:MM"
  const [hours, minutes] = timeStr.split(":");
  return `${hours?.padStart(2, "0")}:${minutes?.padStart(2, "0")}`;
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0]; // funciona para "1999-06-01" e "1999-06-01T00:00:00.000Z"
};


const renderIsArray = (array) => {
  return array
    .map((item) => {
      if (typeof item === "object") {
        return Object.entries(item)
          .map(([key, value]) => `<strong>${key}</strong>: ${value}`)
          .join("<br>");
      } else {
        return item;
      }
    })
    .join("<hr>");
};

/**
 * Retorna o tempo decorrido desde a data fornecida
 * @param {string|Date} dateString - Ex: "2026-03-02T16:25:39.000Z"
 * @returns {string} - "há X dias", "há X horas", etc.
 */
function timeSince(dateString) {
  const now = new Date();
  const past = new Date(dateString);

  const diffMs = now - past; // diferença em milissegundos
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffMinutes > 0) return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  return `há ${diffSeconds} segundo${diffSeconds > 1 ? 's' : ''}`;
}


// function normalizeUploadedData(rawData) {
//   return rawData.map((row, index) => {
//     const formattedRow = {};

//     for (const [key, value] of Object.entries(row)) {
//       const field = key
//         .trim()
//         .toLowerCase()
//         .replace(/[\s\-]/g, "_");

//       if (isExcelDate(value)) {
//         const date = new Date((value - 25569) * 86400 * 1000);
//         formattedRow[field] = date.toISOString().split("T")[0]; // YYYY-MM-DD
//       } else if (
//         typeof value === "string" &&
//         value.match(/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/)
//       ) {
//         const [day, month, year] = value.split(/[\/\-]/);
//         formattedRow[field] = `${year}-${month}-${day}`;
//       } else if (
//         typeof value === "string" &&
//         value.trim().startsWith("[") &&
//         value.trim().endsWith("]")
//       ) {
//         try {
//           formattedRow[field] = JSON.stringify(JSON.parse(value.trim()));
//         } catch {
//           formattedRow[field] = value;
//         }
//       } else {
//         formattedRow[field] = value === "" ? null : value;
//       }
//     }

//     // Montar o array de guardians
//     const guardians = [];

//     if (formattedRow.guardian_name_1 || formattedRow.guardian_phone_number_1) {
//       guardians.push({
//         name: formattedRow.guardian_name_1 || null,
//         phone_number: formattedRow.guardian_phone_number_1 || null,
//       });
//     }

//     if (formattedRow.guardian_name_2 || formattedRow.guardian_phone_number_2) {
//       guardians.push({
//         name: formattedRow.guardian_name_2 || null,
//         phone_number: formattedRow.guardian_phone_number_2 || null,
//       });
//     }

//     if (guardians.length > 0) {
//       formattedRow.guardians = guardians;
//     }

//     // Remove os campos originais para evitar redundância
//     delete formattedRow.guardian_name_1;
//     delete formattedRow.guardian_phone_number_1;
//     delete formattedRow.guardian_name_2;
//     delete formattedRow.guardian_phone_number_2;

//     return formattedRow;
//   });
// }

  const formatLocalDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2,"0")} de ${showMonth(Number(d.getMonth() + 1))?.abrev} de ${d.getFullYear()}`;
  };

  const months = [
    {index: 1, label: "Janeiro", abrev: "Jan"},
    {index: 2, label: "Fevereiro", abrev: "Fev"},
    {index: 3, label: "Março", abrev: "Mar"},
    {index: 4, label: "Abril", abrev: "Abr"},
    {index: 5, label: "Maio", abrev: "Mai"},
    {index: 6, label: "Junho", abrev: "Jun"},
    {index: 7, label: "Julho", abrev: "Jul"},
    {index: 8, label: "Agosto", abrev: "Ago"},
    {index: 9, label: "Setembro", abrev: "Set"},
    {index: 10, label: "Outubro", abrev: "Out"},
    {index: 12, label: "Novembro", abrev: "Nov"},
    {index: 12, label: "Dezembro", abrev: "Dez"},

  ]

  const showMonth = (month) => {
    if(month){
      const match = months.find(m => m.index == month);
      return match;
    }

    return "";
  }

export {
    course_sigla,
    formatValue,
    leadingZero,
    isDate,
    isExcelDate,
    excelDateToString,
    formatTimeForInput,
    formatDateForInput,
    renderIsArray,
    formatLocalDate,
    timeSince
};
