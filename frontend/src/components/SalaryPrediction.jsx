import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PredictSalary = () => {
    const [country, setCountry] = useState("United States of America");
    const [education, setEducation] = useState("Bachelor’s degree");
    const [experience, setExperience] = useState(3);
    const [predictedSalary, setPredictedSalary] = useState(null);

    const countries = [
        "United States of America",
        "Germany",
        "United Kingdom of Great Britain and Northern Ireland",
        "Canada",
        "India",
        "France",
        "Netherlands",
        "Australia",
        "Brazil",
        "Spain",
        "Sweden",
        "Italy",
        "Poland",
        "Switzerland",
        "Denmark",
        "Norway",
        "Israel",
    ];

    const educationLevels = [
        "Bachelor’s degree",
        "Less than a Bachelors",
        "Master’s degree",
        "Post grad",
    ];

    const handleCountryChange = (e) => {
        setCountry(e.target.value);
    };

    const handleEducationChange = (e) => {
        setEducation(e.target.value);
    };

    const handleExperienceChange = (e) => {
        setExperience(e.target.value);
    };

    const handlePrediction = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/predict/', {
                country,
                education,
                experience,
            });
            const salaryString = response.data?.predicted_salary;
            const salaryNumber = parseFloat(salaryString.replace('$', '').trim());
            const salaryInRupees = salaryNumber * 86.58;
            setPredictedSalary(salaryInRupees);
            console.log(salaryInRupees);
            console.log(salaryNumber);

        } catch (error) {
            console.error("Error predicting salary:", error);
        }
    };
    useEffect(() => {

        console.log("predicted salary is: ", predictedSalary);
    }, [predictedSalary])

    return (
        <div className="bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
                    Software Developer Salary Prediction in 2023
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    We need some information to predict the salary
                </p>
    
                <div className="mb-4">
                    <label htmlFor="country" className="block text-gray-700 font-medium mb-2">
                        Country
                    </label>
                    <select
                        id="country"
                        value={country}
                        onChange={handleCountryChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {countries.map((c, index) => (
                            <option key={index} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
    
                <div className="mb-4">
                    <label htmlFor="education" className="block text-gray-700 font-medium mb-2">
                        Education Level
                    </label>
                    <select
                        id="education"
                        value={education}
                        onChange={handleEducationChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {educationLevels.map((e, index) => (
                            <option key={index} value={e}>
                                {e}
                            </option>
                        ))}
                    </select>
                </div>
    
                <div className="mb-4">
                    <label htmlFor="experience" className="block text-gray-700 font-medium mb-2">
                        Years of Experience
                    </label>
                    <input
                        type="range"
                        id="experience"
                        min="0"
                        max="50"
                        value={experience}
                        onChange={handleExperienceChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="block text-center mt-2 text-gray-600">{experience} years</span>
                </div>
    
                <button
                    onClick={handlePrediction}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
                >
                    Calculate Salary
                </button>
    
                <div className="mt-6 text-center">
                    {predictedSalary && (
                        <h2 className="text-2xl font-semibold text-gray-800">
                            The estimated salary is ₹{predictedSalary.toFixed(2)}
                        </h2>
                    )}
                </div>
            </div>
        </div>
    );
    
};

export default PredictSalary;
