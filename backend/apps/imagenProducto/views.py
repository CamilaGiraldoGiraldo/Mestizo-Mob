from rest_framework import viewsets
from .models import ImagenProducto
from .serializer import ImagenProductoSerializer
 
class ImagenProductoViewSet(viewsets.ModelViewSet):
    queryset = ImagenProducto.objects.all()
    serializer_class = ImagenProductoSerializer
 