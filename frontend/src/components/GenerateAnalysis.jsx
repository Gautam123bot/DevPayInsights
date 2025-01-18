import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Papa from 'papaparse';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ExplorePage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetching and cleaning the data
    const fetchData = async () => {
      const response = await axios.get('path/to/survey_results_public.csv');
      Papa.parse(response.data, {
        complete: (result) => {
          const cleanedData = cleanData(result.data);
          setData(cleanedData);
        },
        header: true,
      });
    };
    fetchData();
  }, []);

  const cleanData = (rawData) => {
    let df = rawData.map((row) => ({
      Country: row.Country,
      EdLevel: cleanEducation(row.EdLevel),
      YearsCodePro: cleanExperience(row.YearsCodePro),
      Salary: parseFloat(row.ConvertedCompYearly),
    }));
    
    // Filter out null salary and handle necessary filters
    df = df.filter(row => row.Salary && row.Salary <= 250000 && row.Salary >= 10000);
    df = df.filter(row => row.Employment === "Employed, full-time");

    // Further data transformations can go here (like shortening categories)
    return df;
  };

  const cleanExperience = (x) => {
    if (x === 'More than 50 years') return 50;
    if (x === 'Less than 1 year') return 0.5;
    return parseFloat(x);
  };

  const cleanEducation = (x) => {
    if (typeof x !== 'string') return "Less than a Bachelors";  // Return default if not a string
    if (x.includes("Bachelor’s degree")) return "Bachelor’s degree";
    if (x.includes("Master’s degree")) return "Master’s degree";
    if (x.includes("Professional degree") || x.includes("Other doctoral")) return "Post grad";
    return "Less than a Bachelors";
  };
  

  if (!data) return <div>Loading...</div>;

  // Data for Pie chart (Country distribution)
  const countryData = getCountryData(data);
  const pieData = {
    labels: countryData.labels,
    datasets: [{
      data: countryData.values,
      backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4caf50', '#e57373'],
    }],
  };

  // Data for Bar chart (Mean Salary based on Country)
  const salaryByCountryData = getSalaryByCountryData(data);
  const barData = {
    labels: salaryByCountryData.labels,
    datasets: [{
      label: 'Mean Salary',
      data: salaryByCountryData.values,
      backgroundColor: '#4caf50',
    }],
  };

  // Data for Line chart (Mean Salary based on Experience)
  const salaryByExperienceData = getSalaryByExperienceData(data);
  const lineData = {
    labels: salaryByExperienceData.labels,
    datasets: [{
      label: 'Mean Salary',
      data: salaryByExperienceData.values,
      borderColor: '#ff6384',
      tension: 0.1,
    }],
  };

  return (
    <div>
      <h1>Explore Software Engineer Salaries</h1>

      <h3>Stack Overflow Developer Survey 2023</h3>

      <h4>Number of Data from Different Countries</h4>
      <Pie data={pieData} />

      <h4>Mean Salary Based On Country</h4>
      <Bar data={barData} />

      <h4>Mean Salary Based on Experience</h4>
      <Line data={lineData} />
    </div>
  );
};

const getCountryData = (data) => {
  const countryCounts = data.reduce((acc, row) => {
    acc[row.Country] = (acc[row.Country] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(countryCounts);
  const values = Object.values(countryCounts);

  return { labels, values };
};

const getSalaryByCountryData = (data) => {
  const salaryByCountry = data.reduce((acc, row) => {
    if (!acc[row.Country]) acc[row.Country] = { totalSalary: 0, count: 0 };
    acc[row.Country].totalSalary += row.Salary;
    acc[row.Country].count += 1;
    return acc;
  }, {});

  const labels = Object.keys(salaryByCountry);
  const values = labels.map(label => salaryByCountry[label].totalSalary / salaryByCountry[label].count);

  return { labels, values };
};

const getSalaryByExperienceData = (data) => {
  const salaryByExperience = data.reduce((acc, row) => {
    if (!acc[row.YearsCodePro]) acc[row.YearsCodePro] = { totalSalary: 0, count: 0 };
    acc[row.YearsCodePro].totalSalary += row.Salary;
    acc[row.YearsCodePro].count += 1;
    return acc;
  }, {});

  const labels = Object.keys(salaryByExperience).sort((a, b) => a - b);
  const values = labels.map(label => salaryByExperience[label].totalSalary / salaryByExperience[label].count);

  return { labels, values };
};

export default ExplorePage;
