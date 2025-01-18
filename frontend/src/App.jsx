import React, { useState, useEffect } from "react";
import axios from "axios";
import PredictSalary from "./components/SalaryPrediction";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Salary Predictor</h1>
      <div className="max-w-4xl mx-auto">
        <PredictSalary />
        <hr className="my-8" />
      </div>
    </div>
  );
};

export default App;