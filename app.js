const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { PDFExtract } = require('pdf.js-extract');
const pdfExtract = new PDFExtract();

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "pdfFile") {
      cb(null, "uploads/");
    } else if (file.fieldname === "logo") {
      cb(null, "public/images/");
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "pdfFile" && file.mimetype === "application/pdf") {
      cb(null, true);
    } else if (file.fieldname === "logo" && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("pdfFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const filePath = req.file.path;
    const options = {};

    // Extract PDF content
    const data = await pdfExtract.extract(filePath, options);

    // Check if logo exists
    const logoPath = path.join(__dirname, 'public', 'images', 'logo.png');
    const logoExists = fs.existsSync(logoPath);
    
    // Process the PDF data to create HTML content with editable fields
    let htmlContent = `
      <div class="pdf-content">
        ${logoExists ? `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="/images/logo.png" style="width: 60px; height: auto;" alt="Logo">
          </div>
        ` : ''}
        <div class="college-name" style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 5px;">
          P E S COLLEGE OF ENGINEERING - 571401, KARNATAKA, INDIA
        </div>
        <div class="college-affiliation" style="text-align: center; font-size: 11pt; margin-bottom: 5px;">
          (An Autonomous Institution Affiliated to Visvesvaraya Technological University, Belagavi)
        </div>
        <div class="form-title" style="text-align: center; font-size: 12pt; font-weight: bold; margin-bottom: 10px;">
          REGULAR COURSE REGISTRATION FORM
        </div>
        <div class="date" style="text-align: right; font-size: 11pt; margin-bottom: 10px;">
          Date: <input type="date" id="formDate" value="2025-03-17" style="border: none; background: none; font-size: 11pt; text-align: right;">
        </div>
        <div class="student-details" style="font-size: 11pt; margin-bottom: 10px;">
          <div style="margin-bottom: 5px;"><strong>Name of the Student::</strong> <input type="text" id="studentName" value="HARSHITHA M D" style="border: none; background: none; font-size: 11pt; width: 200px;"></div>
          <div style="margin-bottom: 5px;"><strong>USN::</strong> <input type="text" id="usn" value="4PS22CI015" style="border: none; background: none; font-size: 11pt; width: 150px;"></div>
          <div style="margin-bottom: 5px;"><strong>Degree::</strong> <input type="text" id="degree" value="BE" style="border: none; background: none; font-size: 11pt; width: 100px;"></div>
          <div style="margin-bottom: 5px;"><strong>Department::</strong> <input type="text" id="department" value="Computer Science and Engineering (Artificial Intelligence and Machine Learning)" style="border: none; background: none; font-size: 11pt; width: 400px;"></div>
          <div style="margin-bottom: 5px;"><strong>Semester::</strong> <input type="text" id="semester" value="6" style="border: none; background: none; font-size: 11pt; width: 50px;"></div>
        </div>
        <div class="course-table" style="margin-bottom: 10px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 11pt;">SI No.</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 11pt;">Course Title</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 11pt;">Course Code</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 11pt;">Course Dept</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 11pt;">Course Term</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 11pt;">Credits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 11pt;">1</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: left; font-size: 11pt;"><input type="text" id="courseTitle" value="Digital Supply Chain Management" style="border: none; background: none; font-size: 11pt; width: 100%;"></td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 11pt;"><input type="text" id="courseCode" value="P22IP06052" style="border: none; background: none; font-size: 11pt; width: 100%; text-align: center;"></td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 11pt;"><input type="text" id="courseDept" value="IP" style="border: none; background: none; font-size: 11pt; width: 100%; text-align: center;"></td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 11pt;"><input type="text" id="courseTerm" value="6" style="border: none; background: none; font-size: 11pt; width: 100%; text-align: center;"></td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 11pt;"><input type="text" id="credits" value="3" style="border: none; background: none; font-size: 11pt; width: 100%; text-align: center;"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="total-credits" style="text-align: right; font-size: 11pt; font-weight: bold; margin-bottom: 20px;">
          Total Credits: <span id="totalCredits">3</span>
        </div>
        <div class="signatures" style="display: flex; justify-content: space-between; margin-top: 30px;">
          <div style="text-align: center; width: 30%;">
            <div style="border-bottom: 1px solid #000; margin-bottom: 5px;"></div>
            <div style="font-size: 11pt;">Signature of the Student</div>
          </div>
          <div style="text-align: center; width: 30%;">
            <div style="border-bottom: 1px solid #000; margin-bottom: 5px;"></div>
            <div style="font-size: 11pt;">Signature of the Mentor</div>
          </div>
          <div style="text-align: center; width: 30%;">
            <div style="border-bottom: 1px solid #000; margin-bottom: 5px;"></div>
            <div style="font-size: 11pt;">Signature of the HOD</div>
          </div>
        </div>
        <label for="courseDescription">Course Description:</label>
        <input type="text" id="courseDescription" name="courseDescription" />
      </div>
      <div id="loading" style="display: none;">Generating PDF...</div>
      <button id="exportBtn" class="btn-primary" onclick="exportPDF()">Export PDF</button>
    `;

    // Store the file information in session or pass to the editor
    res.render("editor", {
      pdfContent: htmlContent,
      originalFile: req.file.filename,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).send("Error processing PDF file");
  }
});

app.post("/export", async (req, res) => {
  try {
    console.log("Export endpoint hit");
    const { formData } = req.body;

    if (!formData) {
      console.log("No form data provided");
      return res.status(400).send('No form data provided');
    }

    console.log("Received form data:", formData);

    // Create a new PDF document with A4 size
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=course-registration.pdf'
      });
      res.end(pdfData);
    });

    // Check if logo exists and add it to the PDF
    const logoPath = path.join(__dirname, 'public', 'images', 'logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, {
        fit: [60, 60],
        align: 'center'
      });
      doc.moveDown(1);
    }

    // College Name
    doc.font('Helvetica-Bold')
       .fontSize(14)
       .text('P E S COLLEGE OF ENGINEERING - 571401, KARNATAKA, INDIA', {
         align: 'center'
       });
    doc.moveDown(0.5);

    // College Affiliation
    doc.font('Helvetica')
       .fontSize(11)
       .text('(An Autonomous Institution Affiliated to Visvesvaraya Technological University, Belagavi)', {
         align: 'center'
       });
    doc.moveDown(0.5);

    // Form Title
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('REGULAR COURSE REGISTRATION FORM', {
         align: 'center'
       });
    doc.moveDown(1);

    // Date
    doc.font('Helvetica')
       .fontSize(11)
       .text(`Date: ${formData.formDate}`, {
         align: 'right'
       });
    doc.moveDown(1);

    // Student Details
    doc.font('Helvetica')
       .fontSize(11);
    
    doc.text(`Name of the Student:: ${formData.studentName}`);
    doc.text(`USN:: ${formData.usn}`);
    doc.text(`Degree:: ${formData.degree}`);
    doc.text(`Department:: ${formData.department}`);
    doc.text(`Semester:: ${formData.semester}`);
    doc.moveDown(1);

    // Course Table
    const tableTop = doc.y;
    const pageWidth = doc.page.width - 100;
    const colWidths = {
      slNo: pageWidth * 0.1,
      courseTitle: pageWidth * 0.3,
      courseCode: pageWidth * 0.2,
      courseDept: pageWidth * 0.15,
      courseTerm: pageWidth * 0.15,
      credits: pageWidth * 0.1
    };

    // Table Headers
    doc.font('Helvetica-Bold');
    let currentX = 50;
    let currentY = tableTop;

    // Draw table header cells
    const headers = [
      { text: 'SI No.', width: colWidths.slNo },
      { text: 'Course Title', width: colWidths.courseTitle },
      { text: 'Course Code', width: colWidths.courseCode },
      { text: 'Course Dept', width: colWidths.courseDept },
      { text: 'Course Term', width: colWidths.courseTerm },
      { text: 'Credits', width: colWidths.credits }
    ];

    headers.forEach(header => {
      doc.rect(currentX, currentY, header.width, 25).stroke();
      doc.text(header.text, currentX + 2, currentY + 7, {
        width: header.width - 4,
        align: 'center'
      });
      currentX += header.width;
    });

    // Table Data
    currentY += 25;
    currentX = 50;
    doc.font('Helvetica');

    const rowData = [
      { text: '1', width: colWidths.slNo },
      { text: formData.courseTitle, width: colWidths.courseTitle },
      { text: formData.courseCode, width: colWidths.courseCode },
      { text: formData.courseDept, width: colWidths.courseDept },
      { text: formData.courseTerm, width: colWidths.courseTerm },
      { text: formData.credits, width: colWidths.credits }
    ];

    rowData.forEach(cell => {
      doc.rect(currentX, currentY, cell.width, 25).stroke();
      doc.text(cell.text, currentX + 2, currentY + 7, {
        width: cell.width - 4,
        align: cell.text === '1' ? 'center' : 'left'
      });
      currentX += cell.width;
    });

    // Total Credits
    doc.moveDown(2);
    doc.font('Helvetica-Bold')
       .text(`Total Credits: ${formData.totalCredits}`, {
         align: 'right'
       });
    doc.moveDown(2);

    // Signatures
    const signatureY = doc.y + 30;
    const signatureWidth = (pageWidth - 100) / 3;

    ['Signature of the Student', 'Signature of the Mentor', 'Signature of the HOD'].forEach((text, i) => {
      const x = 50 + (i * signatureWidth) + (i * 50);
      doc.moveTo(x, signatureY)
         .lineTo(x + signatureWidth, signatureY)
         .stroke();
      
      doc.font('Helvetica')
         .fontSize(11)
         .text(text, x, signatureY + 5, {
           width: signatureWidth,
           align: 'center'
         });
    });

    // Finalize PDF
    doc.end();
    console.log("PDF generation completed");
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).send('Error generating PDF: ' + error.message);
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Create public/images directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, "public", "images"))) {
  fs.mkdirSync(path.join(__dirname, "public", "images"), { recursive: true });
}

// Add image upload route
app.post("/upload-image", upload.single("logo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Rename the uploaded file to logo.png
    const newPath = path.join(__dirname, "public", "images", "logo.png");
    fs.renameSync(req.file.path, newPath);

    res.json({ success: true, message: "Logo uploaded successfully" });
  } catch (error) {
    console.error("Error uploading logo:", error);
    res.status(500).json({ error: "Error uploading logo" });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use. Trying port ${port + 1}...`);
    const newPort = port + 1;
    app.listen(newPort, () => {
      console.log(`Server running at http://localhost:${newPort}`);
    });
  } else {
    console.error('Server error:', err);
  }
});
