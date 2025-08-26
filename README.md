# Soil Calculators Monorepo

This project is a monorepo that has a collection of specialized, web-based calculators designed for soil science applications. We want to provide farmers, agronomists, students, and researchers with accessible, easy-to-use interfaces for performing complex agricultural calculations.

---

## Calculators

This repository contains the following calculators:

### 1. Nutrient Balance Calculator

The Nutrient Balance Calculator is a sophisticated tool for determining precise fertilizer recommendations for various crops. Proper nutrient management is critical for achieving optimal crop yields while preventing nutrient runoff that can harm local ecosystems.

* **Purpose:** To calculate the required amounts of Nitrogen (N), Phosphorus (P), and Potassium (K) based on soil test data and crop-specific needs.
* **How it Works:** The user inputs their current soil test results (in ppm or lb/ac), selects the crop they intend to grow, and specifies a yield goal. The calculator processes this information using established agronomic models to determine the nutrient deficit or surplus.
* **Output:** The tool provides a clear recommendation for N, P, and K application rates. It also includes a practical feature that suggests the closest commercial fertilizer blends available, simplifying the process of purchasing and applying the correct products.

### 2. Limestone Calculator

Soil acidity is a major limiting factor for crop production in many regions. The Limestone Calculator is designed to help users determine the precise amount of limestone required to neutralize soil acidity, specifically by targeting aluminum toxicity.

* **Purpose:** To calculate the application rate of limestone needed to raise the soil pH to a desired level for optimal plant growth.
* **How it Works:** The user enters the soil's aluminum content, which is a primary driver of acidity in many soils. The calculator uses this value to compute the necessary amount of liming material.
* **Features:**
  * **Bilingual Interface:** The tool is fully available in both English and Spanish to serve a wider range of users.
  * **Flexible Units:** It provides results in multiple common units, including tons per acre (t/ac) and pounds per 1000 square feet (lb/1000 ft²), making it useful for both large-scale agriculture and smaller garden plots.

### 3. Compost Calculator

This calculator helps quantify the nutrient contributions from compost applications. As organic amendments become more popular for improving soil health, it's important to account for the nutrients they provide to avoid over-fertilization.

* **Purpose:** To calculate the total amount of Nitrogen (N), Phosphorus (P), and Potassium (K) being applied to a field or garden through compost.
* **How it Works:** The user selects the type of compost being used (e.g., manure, yard waste) and enters the total volume or weight being applied over a specific area.
* **Output:** The calculator estimates the total pounds of N, P, and K supplied by the compost application, allowing the user to adjust their synthetic fertilizer plan accordingly.

---

## Developer Tools

### Excel to JavaScript Converter

This is an internal developer utility created to streamline the process of migrating calculation logic from spreadsheets to web applications. Though originally developed for the NRCS Nutrient Balance Calculator, it's aided us greatly in the development of other calculators.

* **Problem Solved:** Many agricultural models and calculators are originally developed and tested in Microsoft Excel. Manually translating complex, nested Excel formulas into JavaScript is a time-consuming and error-prone task.
* **Functionality:** This tool parses `.csv` files that contain Excel formulas. It analyzes the formula syntax and attempts to generate equivalent JavaScript code. This significantly accelerates the development and validation of new web-based calculators, ensuring they are faithful to the original scientific models.
