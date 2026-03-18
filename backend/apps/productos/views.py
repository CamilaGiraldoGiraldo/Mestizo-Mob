from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Producto, ImagenDimension
from .serializers import ProductoSerializer, ImagenDimensionSerializer


class ProductoViewSet(viewsets.ModelViewSet):

    queryset = Producto.objects.all().order_by('id')
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    filterset_fields = ['categoria']
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['precio', 'nombre', 'stock']
    ordering = ['id']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class ImagenDimensionViewSet(viewsets.ModelViewSet):

    queryset = ImagenDimension.objects.all().order_by('producto', 'orden')
    serializer_class = ImagenDimensionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context