from django.urls import path
from .views import EnvioCreateView

urlpatterns = [
    path('', EnvioCreateView.as_view(), name='envio-create'),
]