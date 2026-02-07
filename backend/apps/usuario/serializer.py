from rest_framework import serializers
from .models import usuario

class envioSerializer(serializers.ModelSerializer):
    class Meta:
        model = usuario
        fields = '__all__'
