const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { jsPDF } = require("jspdf");
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

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

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

// Upload PDF and convert to HTML
app.post("/upload", upload.single("pdfFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const filePath = req.file.path;

    // Read the PDF file and extract text
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);

    // Convert extracted text into simple HTML format
    const pdfContent = pdfData.text.replace(/\n/g, "<br>");

    // Render the editor page with the extracted content
    res.render("editor", {
      pdfContent: pdfContent,
      originalFile: req.file.filename,
    });

  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).send("Error processing PDF file");
  }
});



app.post("/export", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).send("No content provided");
    }


    const browser = await puppeteer.launch();
    const page = await browser.newPage();

 
    await page.setContent(content, {
      waitUntil: 'networkidle0', 
    });

    // Generate the PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px',
      },
    });


    await browser.close();

    
    res.writeHead(200, {
      "Content-Length": Buffer.byteLength(pdfBuffer),
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=edited-document.pdf",
    });
    res.end(pdfBuffer);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    res.status(500).send("Error generating PDF: " + error.message);
  }
});
// Upload logo
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

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Create public/images directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, "public", "images"))) {
  fs.mkdirSync(path.join(__dirname, "public", "images"), { recursive: true });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
