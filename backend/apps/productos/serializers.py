from rest_framework import serializers
from .models import Producto
from apps.imagenProducto.models import ImagenProducto
from apps.colores.models import ColorProducto
from apps.colores.serializers import ColorSerializer as BaseColorSerializer


# ================= ImagenProducto =================
class ImagenProductoSerializer(serializers.ModelSerializer):
    imagen = serializers.SerializerMethodField()

    class Meta:
        model = ImagenProducto
        fields = ['imagen']

    def get_imagen(self, obj):
        if obj.imagen:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.imagen.url) if request else obj.imagen.url
        return None


# ================= ColorSerializer =================
class ColorSerializer(BaseColorSerializer):
    imagen = serializers.SerializerMethodField()

    def get_imagen(self, obj):
        if obj.imagen:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.imagen.url) if request else obj.imagen.url
        return None


# ================= ProductoSerializer =================
class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(
        source='categoria.nombre',
        read_only=True
    )

    imagenes = ImagenProductoSerializer(
        many=True,
        read_only=True
    )

    colores = ColorSerializer(
        many=True,
        read_only=True
    )

    modelo_glb = serializers.FileField(read_only=True)
    modelo_usdz = serializers.FileField(read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id',
            'codigo',
            'nombre',
            'descripcion',
            'precio',
            'stock',
            'categoria',
            'categoria_nombre',
            'imagenes',
            'colores',
            'modelo_glb',
            'modelo_usdz'
        ]