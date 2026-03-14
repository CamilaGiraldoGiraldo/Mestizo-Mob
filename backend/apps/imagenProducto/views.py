from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ImagenProducto
from .serializer import ImagenProductoSerializer

class ImagenProductoViewSet(viewsets.ModelViewSet):
    queryset = ImagenProducto.objects.all().order_by("orden")
    serializer_class = ImagenProductoSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]