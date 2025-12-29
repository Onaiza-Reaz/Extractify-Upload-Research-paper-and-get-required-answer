# Extractify – Research Paper Question Answering System

## 🔍 Overview

Extractify is an AI-powered research paper question-answering system designed specifically for students and teachers.
It enables users to upload research papers in PDF format and ask academic and technical questions to quickly retrieve precise information.

Users can ask questions such as:

Which algorithm is used in this research paper?

What is the model architecture?

Explain the methodology

What dataset is used?

What are the results and conclusions?

The system uses a Retrieval-Augmented Generation (RAG) approach to provide accurate, context-aware answers from the uploaded PDF.

## Problem Statement

Research papers are lengthy and complex, making it difficult for students and educators to quickly extract specific information such as algorithms, methodologies, tables, or experimental results.

Extractify solves this problem by allowing intelligent querying of research papers, including text, tables, and image-based content.

## Solution Approach

Extractify follows a RAG (Retrieval-Augmented Generation) pipeline to ensure:

High accuracy

Reduced hallucinations

Research-focused and contextually grounded answers

## System Architecture

### PDF Upload

User uploads a research paper in PDF format.

### Text & Image Extraction

Text is extracted from the PDF.

Tesseract OCR is used to extract:

Text from images

Tables

Scanned or image-based data within the PDF

### Text Chunking & Transformation

Extracted content is cleaned and divided into smaller chunks.

Chunks are transformed into embeddings using a Hugging Face transformer model.

### Vector Storage

Embeddings are stored in Qdrant, enabling fast similarity-based retrieval.

### Question Answering

User asks an academic question.

Relevant chunks are retrieved from Qdrant.

Retrieved context is passed to Gemini 2.5.

Gemini generates an accurate, research-oriented answer.

## Technologies Used

LLM	Gemini 2.5

Embedding Model	Hugging Face Transformer Model

Vector Database	Qdrant

OCR Engine	Tesseract OCR

Architecture	RAG (Retrieval-Augmented Generation)

Input Type	PDF Only

Domain	Academic Research Papers

## Key Features

Upload research papers in PDF format

Designed for students and teachers

Ask technical and academic questions

Extract algorithms, models, and methodologies

Read tables and image-based data using OCR

Supports scanned and image-heavy PDFs

Efficient and accurate vector-based retrieval

## Use Cases

Understanding complex research papers

Extracting algorithms and methodologies

Reading tables and image-based experimental results

Academic learning and teaching support

Research paper analysis and review

## Future Enhancements

Multi-PDF comparison

Citation-based answer highlighting

Section-wise filtering (Methodology, Results, etc.)

PDF validation and security checks

Improved table-to-structured-data extraction

## Project Scope

✔ Academic research papers
✔ PDF-based question answering
✔ OCR-based table and image text extraction
