import os
import numpy as np
import pandas as pd
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
import pickle
from django.views.decorators.csrf import csrf_exempt
import matplotlib.pyplot as plt
import json

# Load model and encoders
def load_model():
    model_path = os.path.join(settings.BASE_DIR, 'predict_app/dataModel.pkl')
    with open(model_path, 'rb') as file:
        data = pickle.load(file)
    return data


data = load_model()
regressor = data["model"]
le_country = data["le_country"]
le_education = data["le_education"]


@csrf_exempt
def predict_salary(request):
    countries = (
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
    )

    education_levels = (
        "Bachelor’s degree",
        "Less than a Bachelors",
        "Master’s degree",
        "Post grad",
    )

    if request.method == "POST":
        try:
            data = json.loads(request.body)  # Parse JSON payload
            country = data.get("country")
            education = data.get("education")
            experience = int(data.get("experience", 0))

            # Prepare input for model
            X = np.array([[country, education, experience]])
            X[:, 0] = le_country.transform(X[:, 0])
            X[:, 1] = le_education.transform(X[:, 1])
            X = X.astype(float)

            # Predict salary
            salary = regressor.predict(X)[0]
            return JsonResponse({
                "predicted_salary": f"${salary:.2f}",
                "success": True
            })
        except Exception as e:
            return JsonResponse({
                "error": str(e),
                "success": False
            }, status=400)

    return JsonResponse({
        "countries": countries,
        "education_levels": education_levels
    })


# Function to shorten categories based on a cutoff value
def shorten_categories(categories, cutoff):
    categorical_map = {}
    for i in range(len(categories)):
        if categories.values[i] >= cutoff:
            categorical_map[categories.index[i]] = categories.index[i]
        else:
            categorical_map[categories.index[i]] = 'Other'
    return categorical_map


# Function to clean the experience column
def clean_experience(x):
    if x == 'More than 50 years':
        return 50
    if x == 'Less than 1 year':
        return 0.5
    return float(x)


# Function to clean the education column
def clean_education(x):
    if 'Bachelor’s degree' in x:
        return 'Bachelor’s degree'
    if 'Master’s degree' in x:
        return 'Master’s degree'
    if 'Professional degree' in x or 'Other doctoral' in x:
        return 'Post grad'
    return 'Less than a Bachelors'


# Load and clean the data
def load_data():
    df = pd.read_csv(os.path.join(settings.BASE_DIR, 'predict/survey_results_public.csv'))
    df = df[["Country", "EdLevel", "YearsCodePro", "Employment", "ConvertedCompYearly"]]
    df = df.rename({"ConvertedCompYearly": "Salary"}, axis=1)
    df = df[df["Salary"].notnull()]
    df = df.dropna()
    df = df[df["Employment"] == "Employed, full-time"]
    df = df.drop("Employment", axis=1)

    country_map = shorten_categories(df.Country.value_counts(), 400)
    df['Country'] = df['Country'].map(country_map)
    df = df[df["Salary"] <= 250000]
    df = df[df["Salary"] >= 10000]
    df = df[df['Country'] != 'Other']

    df['YearsCodePro'] = df['YearsCodePro'].apply(clean_experience)
    df['EdLevel'] = df['EdLevel'].apply(clean_education)

    return df


def show_explore_page(request):
    try:
        df = load_data()

        # Prepare data for charts
        country_data = df["Country"].value_counts().to_dict()
        country_salary_data = df.groupby("Country")["Salary"].mean().sort_values(ascending=True).to_dict()
        experience_salary_data = df.groupby("YearsCodePro")["Salary"].mean().sort_values(ascending=True).to_dict()

        return JsonResponse({
            "countryDistribution": country_data,
            "countrySalary": country_salary_data,
            "experienceSalary": experience_salary_data,
            "success": True
        })
    except Exception as e:
        return JsonResponse({
            "error": str(e),
            "success": False
        }, status=500)
