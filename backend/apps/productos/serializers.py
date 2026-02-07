from rest_framework import serializers
from .models import Producto

class ProductoSerializer(serializers.ModelSerializer):
    # Mostrar el nombre de la categoría directamente
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Producto
        fields = ['codigo', 'nombre', 'descripcion', 'precio', 'stock', 'categoria', 'categoria_nombre']
