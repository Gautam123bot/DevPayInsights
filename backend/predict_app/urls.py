from django.urls import path
from .views import predict_salary

urlpatterns = [
    path("predict/", predict_salary, name="predict_salary"),
]
