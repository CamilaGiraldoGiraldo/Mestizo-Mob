from rest_framework import serializers
from .models import categorias

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = categorias
        fields = '__all__'
