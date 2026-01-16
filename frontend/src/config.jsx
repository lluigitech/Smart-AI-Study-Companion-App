// src/config.js

// Ito ang IP Address mo galing sa ipconfig
export const API_BASE_URL = "http://192.168.1.89:5000"; 

export const getFileUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http")) return filePath; 
    return `${API_BASE_URL}${filePath}`;
};