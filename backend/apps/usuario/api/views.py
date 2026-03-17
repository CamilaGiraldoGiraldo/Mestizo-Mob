from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token

from apps.usuario.models import Usuario
from apps.usuario.serializers import UsuarioSerializer


# ── ViewSet para el panel admin (GET, PUT, DELETE, etc.) ──────
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('nombre')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]


# ── Login público ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    correo     = request.data.get('correo')
    contrasena = request.data.get('contrasena')

    if not correo or not contrasena:
        return Response(
            {'error': 'Correo y contraseña son requeridos.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    usuario = authenticate(request, username=correo, password=contrasena)

    if usuario is None:
        return Response(
            {'error': 'Correo o contraseña incorrectos.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not usuario.is_active:
        return Response(
            {'error': 'Esta cuenta está desactivada.'},
            status=status.HTTP_403_FORBIDDEN
        )

    token, _ = Token.objects.get_or_create(user=usuario)

    return Response({
        'token': token.key,
        'user': {
            'identificacion': usuario.identificacion,
            'nombre':         usuario.nombre,
            'primerApellido': usuario.primerApellido,
            'correo':         usuario.correo,
            'is_staff':       usuario.is_staff,
            'is_superuser':   usuario.is_superuser,
        }
    }, status=status.HTTP_200_OK)