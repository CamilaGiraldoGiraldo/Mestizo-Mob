from rest_framework import serializers
from .models import ImagenProducto

class imagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenProducto
        fields = '__all__'
