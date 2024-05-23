# Generated by Django 4.2.11 on 2024-05-20 23:18

from django.conf import settings
import django.contrib.auth.models
import django.contrib.auth.validators
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'db_table': 'content"."person',
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='PersonProject',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('role', models.TextField(choices=[('admin', 'Admin'), ('advanced', 'Advanced'), ('editor', 'Editor'), ('restricted', 'Resctricted')], verbose_name='role')),
                ('person', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'content"."person_project',
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255, verbose_name='name')),
                ('start_date', models.DateTimeField(auto_now_add=True, verbose_name='start_date')),
                ('status', models.TextField(choices=[('as scheduled', 'As Scheduled'), ('at risk', 'At Risk'), ('expired', 'Expired'), ('no status', 'No Status')], default='no status', verbose_name='status')),
                ('progress', models.FloatField(default=0, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(1)], verbose_name='progress')),
                ('creator', models.ForeignKey(blank=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='created_projects', to=settings.AUTH_USER_MODEL)),
                ('members', models.ManyToManyField(related_name='projects', through='gantt.PersonProject', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'content"."project',
            },
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('created', models.DateTimeField(auto_now_add=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255, verbose_name='name')),
                ('status', models.TextField(choices=[('open', 'Open'), ('in progress', 'In Progress'), ('done', 'Done'), ('closed', 'Closed')], default='open', verbose_name='status')),
                ('type', models.TextField(choices=[('task', 'Task'), ('subtask', 'Subtask'), ('milestone', 'Milestone')], verbose_name='type')),
                ('color', models.CharField(max_length=7)),
                ('priority', models.TextField(choices=[('the highest', 'The Highest'), ('high', 'High'), ('medium', 'Medium'), ('low', 'Low'), ('the lowest', 'The Lowest')], default='medium', verbose_name='priority')),
                ('start_datetime', models.DateTimeField(verbose_name='start_datetime')),
                ('end_datetime', models.DateTimeField(verbose_name='end_datetime')),
                ('modified', models.DateTimeField(auto_now=True)),
                ('assignees', models.ManyToManyField(limit_choices_to={'projects': models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gantt.project')}, related_name='tasks', to=settings.AUTH_USER_MODEL)),
                ('dependencies', models.ManyToManyField(blank=True, to='gantt.task')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gantt.project')),
            ],
            options={
                'db_table': 'content"."task',
            },
        ),
        migrations.AddField(
            model_name='personproject',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gantt.project'),
        ),
        migrations.CreateModel(
            name='File',
            fields=[
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('file', models.FileField(upload_to='task_files/')),
                ('assignee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to=settings.AUTH_USER_MODEL)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='gantt.task')),
            ],
            options={
                'db_table': 'content"."file',
            },
        ),
    ]
