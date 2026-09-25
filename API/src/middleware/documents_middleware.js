const { query } = require("../models/models");

const verifyDocumentExistence = async (id, type) => {
    const [row] = await query("SELECT * FROM documents WHERE student_id = ? AND document_type_id")
}
