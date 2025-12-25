# Khotba Preparation Page - User Guide

## Overview
The Khotba Preparation page is now fully interactive with modern Arabic PDF export capabilities.

## Features

### 1. **Interactive Content Editing**
- **Title Input**: Large, prominent title field that supports both English and Arabic
- **Main Content Area**: Expandable textarea for writing the full Khotba content
- **Importance Section**: Dedicated area to explain why the topic is important
- **Supporting Data**: Section for references, links, and additional information

### 2. **Text Formatting Toolbar**
Located at the top of the content area:

- **Text Alignment**:
  - Left align (for English)
  - Center align
  - Right align (default, perfect for Arabic)
  
- **Font Size**: Choose from 12px to 32px
  - Default: 16px
  - Recommended for Arabic: 18px-24px

- **Character Counter**: Real-time character count for the main content

### 3. **File Attachments**
- Click "Add file" button to upload supporting documents
- Drag and drop files directly into the upload modal
- View all attached files with file size information
- Remove files individually if needed

### 4. **PDF Export**
Click the "Export as PDF" button to generate a professional Arabic PDF with:

- **Header**: "خطبة الجمعة" (Friday Sermon) with date
- **Formatted Sections**:
  - موضوع الخطبة (Khotba Subject)
  - محتوى الخطبة (Khotba Content)
  - الأهمية (Importance)
  - البيانات الداعمة (Supporting Data)
  - الملفات المرفقة (Attached Files)
- **Footer**: Document creation attribution
- **RTL Support**: Proper right-to-left text direction for Arabic
- **Professional Styling**: Color-coded headers, proper spacing, and clean layout

## How to Use

### Step 1: Enter Content
1. Type your Khotba title in the large input field
2. Write the main content in the textarea
3. Add importance explanation
4. Include supporting data and references

### Step 2: Format Text
1. Select text alignment (right for Arabic)
2. Choose appropriate font size
3. Monitor character count

### Step 3: Attach Files (Optional)
1. Click "Add file" button
2. Select files or drag and drop
3. Review attached files list

### Step 4: Export to PDF
1. Click "Export as PDF" button
2. Wait for processing (shows loading indicator)
3. PDF will automatically download
4. Success message confirms completion

## PDF File Naming
Files are automatically named: `خطبة_[title]_[date].pdf`

Example: `خطبة_الصبر والشكر_2024-12-22.pdf`

## Technical Details

### Dependencies
- **jsPDF**: PDF generation library
- **html2canvas**: HTML to canvas conversion for high-quality rendering

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Best results with updated browsers

### Arabic Text Support
- Full RTL (right-to-left) support
- Proper Arabic character rendering
- Professional Arabic typography

## Tips for Best Results

1. **For Arabic Content**:
   - Use right alignment
   - Font size 18-24px recommended
   - Keep paragraphs well-spaced

2. **For Mixed Content**:
   - Use center alignment
   - Adjust font size based on language

3. **File Attachments**:
   - Supported formats: PDF, DOC, DOCX, TXT, images
   - File names will appear in the PDF

4. **Content Length**:
   - No strict limits
   - PDF automatically handles multiple pages
   - Very long content may take longer to export

## Troubleshooting

### PDF Export Issues
- **Problem**: Export button not working
  - **Solution**: Ensure content is entered, refresh page if needed

- **Problem**: Arabic text not displaying correctly
  - **Solution**: Use right alignment, ensure browser supports Arabic fonts

- **Problem**: PDF download doesn't start
  - **Solution**: Check browser popup blocker settings

### File Upload Issues
- **Problem**: Files not uploading
  - **Solution**: Check file size (keep under 10MB per file)

## Future Enhancements
- Cloud save functionality
- Template library
- Collaborative editing
- Version history
- Direct sharing options

---

**Created for**: Quran App - Khotba Preparation System
**Last Updated**: December 2024
