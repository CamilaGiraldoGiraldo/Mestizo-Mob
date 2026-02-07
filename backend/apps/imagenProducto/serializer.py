from rest_framework import serializers
from .models import ImagenProducto

class envioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenProducto
        fields = '__all__'
