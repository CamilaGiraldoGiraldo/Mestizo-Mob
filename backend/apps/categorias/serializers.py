from rest_framework import serializers
from .models import Categoria  # ← C mayúscula

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria  # ← C mayúscula
        fields = '__all__'