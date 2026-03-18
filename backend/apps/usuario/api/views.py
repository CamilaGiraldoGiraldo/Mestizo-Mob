from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token

from apps.usuario.models import Usuario, CodigoRecuperacion
from apps.usuario.serializers import UsuarioSerializer


# ── ViewSet para el panel admin ───────────────────────────────
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


# ── Enviar código de recuperación ─────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def enviar_codigo_view(request):
    correo = request.data.get('correo', '').strip().lower()

    if not correo:
        return Response(
            {'error': 'El correo es requerido.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        usuario = Usuario.objects.get(correo=correo)
    except Usuario.DoesNotExist:
        # Respuesta genérica para no revelar si el correo existe
        return Response(
            {'mensaje': 'Si el correo está registrado, recibirás un código.'},
            status=status.HTTP_200_OK
        )

    codigo_obj = CodigoRecuperacion.generar(usuario)

    send_mail(
        subject='Código de recuperación — Mestizo Mobiliario',
        message=(
            f'Hola {usuario.nombre},\n\n'
            f'Tu código de recuperación es: {codigo_obj.codigo}\n\n'
            f'Este código es válido por 15 minutos.\n\n'
            f'Si no solicitaste esto, ignora este mensaje.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[correo],
        fail_silently=False,
    )

    return Response(
        {'mensaje': 'Si el correo está registrado, recibirás un código.'},
        status=status.HTTP_200_OK
    )


# ── Verificar código y cambiar contraseña ────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def resetear_contrasena_view(request):
    correo           = request.data.get('correo', '').strip().lower()
    codigo           = request.data.get('codigo', '').strip()
    nueva_contrasena = request.data.get('nueva_contrasena', '')

    if not correo or not codigo or not nueva_contrasena:
        return Response(
            {'error': 'Correo, código y nueva contraseña son requeridos.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(nueva_contrasena) < 8:
        return Response(
            {'error': 'La contraseña debe tener al menos 8 caracteres.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        usuario = Usuario.objects.get(correo=correo)
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Código inválido o expirado.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    codigo_obj = (
        CodigoRecuperacion.objects
        .filter(usuario=usuario, codigo=codigo, usado=False)
        .order_by('-creado')
        .first()
    )

    if not codigo_obj or not codigo_obj.esta_vigente():
        return Response(
            {'error': 'Código inválido o expirado.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Cambiar contraseña e invalidar código
    usuario.set_password(nueva_contrasena)
    usuario.save()
    codigo_obj.usado = True
    codigo_obj.save()

    # Invalidar todos los tokens activos del usuario
    Token.objects.filter(user=usuario).delete()

    return Response(
        {'mensaje': 'Contraseña actualizada correctamente.'},
        status=status.HTTP_200_OK
    )