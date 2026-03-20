import random
import string
from datetime import timedelta

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.db import models
from django.utils import timezone


class ManageUsuario(BaseUserManager):

    def create_user(self, identificacion, nombre, primerApellido, segundoApellido, correo, telefono, password, **krows):
        usuario = self.model(
            identificacion=identificacion,
            nombre=nombre,
            primerApellido=primerApellido,
            segundoApellido=segundoApellido,
            correo=self.normalize_email(correo),
            telefono=telefono,
            is_staff=False,
            is_superuser=False,
            is_active=True,
            date_joined=timezone.now(),
            **krows
        )
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, identificacion, nombre, primerApellido, segundoApellido, correo, telefono, password, **krows):
        usuario = self.model(
            identificacion=identificacion,
            nombre=nombre,
            primerApellido=primerApellido,
            segundoApellido=segundoApellido,
            correo=self.normalize_email(correo),
            telefono=telefono,
            is_staff=True,
            is_superuser=True,
            is_active=True,
            date_joined=timezone.now(),
            **krows
        )
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario


class Usuario(AbstractBaseUser, PermissionsMixin):
    identificacion          = models.CharField(primary_key=True, max_length=12, unique=True)
    nombre                  = models.CharField(max_length=50)
    primerApellido          = models.CharField(max_length=40)
    segundoApellido         = models.CharField(max_length=40)
    correo                  = models.EmailField(unique=True)
    telefono                = models.CharField(max_length=10)
    is_active               = models.BooleanField(default=True)
    is_superuser            = models.BooleanField(default=False)
    is_staff                = models.BooleanField(default=False)
    date_joined             = models.DateTimeField(default=timezone.now)
    # Marca que la contraseña es temporal y debe cambiarse al próximo login
    debe_cambiar_contrasena = models.BooleanField(default=False)

    groups = models.ManyToManyField(
        Group,
        related_name='usuario_users',
        blank=True,
        help_text='Los grupos a los que pertenece este usuario.'
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name='usuario_users_permissions',
        blank=True,
        help_text='Permisos específicos para este usuario.'
    )

    USERNAME_FIELD  = 'correo'
    REQUIRED_FIELDS = ['identificacion', 'nombre', 'primerApellido', 'segundoApellido', 'telefono']

    objects = ManageUsuario()

    def __str__(self):
        return f"{self.nombre} {self.primerApellido}"


class CodigoRecuperacion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='codigos')
    codigo  = models.CharField(max_length=6)
    creado  = models.DateTimeField(auto_now_add=True)
    usado   = models.BooleanField(default=False)

    def esta_vigente(self):
        return not self.usado and timezone.now() < self.creado + timedelta(minutes=15)

    @classmethod
    def generar(cls, usuario):
        cls.objects.filter(usuario=usuario, usado=False).update(usado=True)
        codigo = ''.join(random.choices(string.digits, k=6))
        return cls.objects.create(usuario=usuario, codigo=codigo)

    def __str__(self):
        return f"{self.usuario.correo} — {self.codigo}"