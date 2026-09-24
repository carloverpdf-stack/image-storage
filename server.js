const express = require("express");
const multer = require("multer");
const path = require("path");

const { put, list, del } = require("@vercel/blob");

const app = express();

const PORT = process.env.PORT || 3000;


// ======================================
// MULTER
// Store uploaded file in memory
// ======================================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        // Vercel Functions have a 4.5 MB request-body limit
        fileSize: 4 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }

    }
});


// ======================================
// SERVE WEBSITE
// ======================================

app.use(express.static(
    path.join(__dirname, "public")
));


// ======================================
// GET ALL IMAGES
// ======================================

app.get("/api/images", async (req, res) => {

    try {

        const result = await list();

        const images = result.blobs.map(blob => {

            return {
                name: blob.pathname,
                url: blob.url
            };

        });

        res.json(images);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Could not load images"
        });

    }

});


// ======================================
// UPLOAD IMAGE
// ======================================

app.post(
    "/api/upload",
    upload.single("image"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    error: "No image selected"
                });

            }


            const extension =
                path.extname(req.file.originalname);


            const filename =
                `images/${Date.now()}${extension}`;


            const blob = await put(
                filename,
                req.file.buffer,
                {
                    access: "public",

                    contentType:
                        req.file.mimetype,

                    addRandomSuffix: true
                }
            );


            res.json({

                success: true,

                image: {
                    name: blob.pathname,
                    url: blob.url
                }

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Upload failed"
            });

        }

    }
);


// ======================================
// DELETE IMAGE
// ======================================

app.delete(
    "/api/images",
    express.json(),

    async (req, res) => {

        try {

            const { url } = req.body;


            if (!url) {

                return res.status(400).json({
                    error: "Image URL is required"
                });

            }


            await del(url);


            res.json({
                success: true
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Could not delete image"
            });

        }

    }
);


// ======================================
// ERROR HANDLER
// ======================================

app.use((error, req, res, next) => {

    console.error(error);

    if (error.code === "LIMIT_FILE_SIZE") {

        return res.status(400).json({
            error: "Image must be smaller than 4 MB"
        });

    }

    res.status(500).json({
        error: error.message || "Something went wrong"
    });

});


// ======================================
// START SERVER
// ======================================

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});