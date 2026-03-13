from rest_framework import viewsets
from .models import ColorProducto
from .serializers import ColorSerializer
 
class ColorProductoViewSet(viewsets.ModelViewSet):
    queryset = ColorProducto.objects.all()
    serializer_class = ColorSerializer
 