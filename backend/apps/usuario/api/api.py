from rest_framework.response import Response
from rest_framework.decorators import api_view
from apps.usuario.models import Usuario
from apps.usuario.api.serializers import UsuarioSerializer

@api_view(['GET', 'POST'])
def usuario_api_view(request):
    if request.method == 'GET':
        usuarios = Usuario.objects.all()
        usuarioSerializer = UsuarioSerializer(usuarios, many = True)
        return Response(usuarioSerializer.data)
    
    elif request.method == 'POST':
        usuarioSerializer = UsuarioSerializer(data = request.data)
        if usuarioSerializer.is_valid():
            usuarioSerializer.create(usuarioSerializer.data)
            return Response(usuarioSerializer.data)
        else:
            return Response (usuarioSerializer.errors)
