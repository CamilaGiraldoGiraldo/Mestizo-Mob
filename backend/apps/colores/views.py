from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ColorProducto
from .serializers import ColorSerializer
 

class ColorProductoViewSet(viewsets.ModelViewSet):
    queryset = ColorProducto.objects.all()
    serializer_class = ColorSerializer
 
    parser_classes = [MultiPartParser, FormParser, JSONParser]