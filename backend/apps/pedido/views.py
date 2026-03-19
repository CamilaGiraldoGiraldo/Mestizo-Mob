from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Pedido
from .serializers import PedidoSerializer


class PedidoCreateView(generics.CreateAPIView):
    serializer_class   = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class PedidoListView(generics.ListAPIView):
    serializer_class   = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Pedido.objects.all().order_by('-fecha').select_related('usuario', 'envio').prefetch_related('items__producto')
        return Pedido.objects.filter(usuario=user).order_by('-fecha').select_related('usuario', 'envio').prefetch_related('items__producto')


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def actualizar_estado_pedido(request, pk):
    """
    Permite a un admin cambiar el estado de un pedido.
    Body: { "estado": "confirmado" }
    """
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'No tienes permiso para realizar esta acción.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        pedido = Pedido.objects.get(pk=pk)
    except Pedido.DoesNotExist:
        return Response({'error': 'Pedido no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    nuevo_estado = request.data.get('estado')
    estados_validos = [e[0] for e in Pedido.ESTADO_CHOICES]

    if nuevo_estado not in estados_validos:
        return Response(
            {'error': f'Estado inválido. Opciones: {", ".join(estados_validos)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    pedido.estado = nuevo_estado
    pedido.save()

    return Response(PedidoSerializer(pedido).data, status=status.HTTP_200_OK)