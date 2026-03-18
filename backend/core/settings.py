from pathlib import Path
import os
import ssl
import cloudinary
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-=7a#28qi61-@!iunu5erza!isajr7enq7hvrddj_*87x!qc_j+'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '10.156.17.132']

AUTH_USER_MODEL = 'usuario.Usuario'

# ==========================
# APPLICATIONS
# ==========================

BASE_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

LOCAL_APPS = [
    'apps.productos',
    'apps.imagenProducto',
    'apps.pedido',
    'apps.envio',
    'apps.usuario',
    'apps.categorias',
    'apps.colores',
    'apps.citas',
]

THIRD_APPS = [
    'rest_framework',
    'rest_framework.authtoken',   # ← AGREGADO
    'django_filters',
    'corsheaders',
    'cloudinary',
    'cloudinary_storage',
    'nested_admin',
]

INSTALLED_APPS = BASE_APPS + LOCAL_APPS + THIRD_APPS


# ==========================
# MIDDLEWARE (CORS ARRIBA)
# ==========================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ==========================
# CORS CONFIG
# ==========================

CORS_ALLOW_ALL_ORIGINS = True


# ==========================
# TEMPLATES
# ==========================

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# ==========================
# DATABASE
# ==========================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mestizo',
        'USER': 'root',
        'PASSWORD': '1234',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
#Cloudinary Config
cloudinary.config(
    cloud_name = "de8ra2czm",
    api_key = "646127835215687",
    api_secret = "KjjCNwirgYffba5-EAwAhjOB_GI",
    secure = True
)

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# Validar contraseña. 
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ==========================
# INTERNATIONALIZATION
# ==========================

LANGUAGE_CODE = 'es'
TIME_ZONE = 'UTC'

USE_I18N = True
USE_TZ = True


# ==========================
# STATIC & MEDIA
# ==========================

STATIC_URL = 'static/'

MEDIA_URL = '/media/'
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'


# ==========================
# DEFAULT PRIMARY KEY
# ==========================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ==========================
# EMAIL CONFIG
# ==========================

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465
EMAIL_USE_TLS = False
EMAIL_USE_SSL = True
EMAIL_HOST_USER = 'mariacamilagiraldogiraldo1214@gmail.com'
EMAIL_HOST_PASSWORD = 'vzhn qxxs qowd ylhm'
DEFAULT_FROM_EMAIL = 'Mestizo Mobiliario <mariacamilagiraldogiraldo1214@gmail.com>'

EMAIL_SSL_CONTEXT = ssl.create_default_context()
EMAIL_SSL_CONTEXT.check_hostname = False
EMAIL_SSL_CONTEXT.verify_mode = ssl.CERT_NONE


# ==========================
# DRF CONFIG
# ==========================

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend'
    ],
    'DEFAULT_PAGINATION_CLASS':
        'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [   # ← AGREGADO
        'rest_framework.authentication.TokenAuthentication',
    ],
}