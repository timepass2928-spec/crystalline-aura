import React, { useEffect, useState } from "react";
import { Logmark } from "./components/Logo";
import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

const PRODUCTS_COLLECTION = "products";
const MAX_STORED_IMAGE_CHARS = 750000;

function readAndCompressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSide = 900;
        let { width, height } = img;

        if (width > maxSide || height > maxSide) {
          if (width >= height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        while (dataUrl.length > MAX_STORED_IMAGE_CHARS && quality > 0.35) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        if (dataUrl.length > MAX_STORED_IMAGE_CHARS) {
          reject(new Error("Image is still too large. Please pick a smaller photo."));
          return;
        }

        resolve(dataUrl);
      };
      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#faf8f5",
    color: "#1c1917",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "16px",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "820px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  topBar: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  btnPrimary: {
    backgroundColor: "#1c1917",
    color: "#ffffff",
    border: "none",
    borderRadius: "999px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  btnSecondary: {
    backgroundColor: "#ffffff",
    color: "#1c1917",
    border: "1px solid #d6d3d1",
    borderRadius: "999px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e7e5e4",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "18px",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  formStack: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    boxSizing: "border-box",
  },
  twoColRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box",
  },
  input: {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #d6d3d1",
    backgroundColor: "#ffffff",
    color: "#1c1917",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  textarea: {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    minHeight: "76px",
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #d6d3d1",
    backgroundColor: "#ffffff",
    color: "#1c1917",
    fontSize: "14px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  fileBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px dashed #a8a29e",
    backgroundColor: "#fafaf9",
    width: "100%",
    boxSizing: "border-box",
  },
  previewImg: {
    width: "100%",
    maxWidth: "220px",
    height: "auto",
    borderRadius: "10px",
    objectFit: "cover",
    border: "1px solid #e7e5e4",
  },
  formActions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "6px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
    marginBottom: "18px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e7e5e4",
    borderRadius: "14px",
    padding: "12px",
    minWidth: 0,
    boxSizing: "border-box",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px",
  },
  productCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e7e5e4",
    borderRadius: "14px",
    padding: "12px",
    minWidth: 0,
    boxSizing: "border-box",
  },
  productImg: {
    width: "100%",
    height: "190px",
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "10px",
    backgroundColor: "#f5f5f4",
  },
};

const emptyForm = {
  title: "",
  category: "CLOTHES",
  subLabel: "",
  details
