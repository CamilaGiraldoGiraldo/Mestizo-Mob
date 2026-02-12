from rest_framework.response import Response
from rest_framework.decorators import api_view
from apps.usuario.models import Usuario
from apps.usuario.api.serializers import UsuarioSerializer

@api_view(['GET'])
def usuario_api_view(request):
    usuarios = Usuario.objects.all()
    usuarioSerializer = UsuarioSerializer(usuarios, many = True)
    return Response(usuarioSerializer.data)
