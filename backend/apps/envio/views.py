from rest_framework import viewsets
from .models import Envio
from .serializers import EnvioSerializer
 
class EnvioViewSet(viewsets.ModelViewSet):
    queryset = Envio.objects.all()
    serializer_class = EnvioSerializer
 