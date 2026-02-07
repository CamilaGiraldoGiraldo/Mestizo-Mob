from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Producto
from .serializers import ProductoSerializer

class ProductoViewSet(viewsets.ModelViewSet):

    queryset = Producto.objects.all().order_by('id')
    serializer_class = ProductoSerializer

    # Permisos: lectura pública, escritura solo para usuarios autenticados
    permission_classes = [IsAuthenticatedOrReadOnly]

    # Filtros, búsqueda y ordenamiento
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria']  
    search_fields = ['nombre', 'descripcion'] 
    ordering_fields = ['precio', 'nombre', 'stock']  
    ordering = ['id'] 
