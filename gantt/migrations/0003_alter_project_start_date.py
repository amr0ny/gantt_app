# Generated by Django 4.2.11 on 2024-05-21 23:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gantt', '0002_alter_project_start_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='start_date',
            field=models.DateField(verbose_name='start_date'),
        ),
    ]