from rest_framework import serializers
from rest_framework.response import Response
from gantt.models import Project, Person, PersonProject, Task
from datetime import datetime
class CustomDateTimeField(serializers.DateTimeField):
    def to_internal_value(self, value):
        try:
            # Пытаемся преобразовать значение в формат datetime
            return datetime.strptime(value, '%d.%m.%Y, %H:%M')
        except ValueError:
            self.fail('invalid', format='DD.MM.YYYY, HH:MM')

    def to_representation(self, value):
        # Возвращаем значение в нужном формате
        return value.strftime('%d.%m.%Y, %H:%M')
    
class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class PersonProjectSerializer(serializers.ModelSerializer):
    person = PersonSerializer()
    role = serializers.CharField(source='get_role_display')

    class Meta:
        model = PersonProject
        fields = ['person', 'role']


class TaskReadSerializer(serializers.ModelSerializer): 
    assignees = PersonSerializer(many=True)

    class Meta:
        model = Task
        fields = ['id', 'name', 'type', 'status', 'assignees', 'color', 'priority', 'start_datetime', 'end_datetime', 'modified']


class TaskWriteSerializer(serializers.ModelSerializer):
    start_datetime = serializers.DateTimeField()
    end_datetime = serializers.DateTimeField()
    class Meta:
        model = Task
        fields = ['id', 'name', 'type', 'color', 'start_datetime', 'end_datetime']

    def create(self, validated_data):
        return Task.objects.create(**validated_data)
    
    


class ProjectReadSerializer(serializers.ModelSerializer):
    members = PersonProjectSerializer(many=True, read_only=True, source='personproject_set')
    tasks = TaskReadSerializer(many=True, read_only=True, source='task_set')
    class Meta:
        model = Project
        fields = ['id', 'name', 'start_date', 'status', 'progress', 'creator', 'members', 'tasks']

class ProjectWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'start_date']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        validated_data['creator'] = user
        project = Project.objects.create(**validated_data)
        
        # Creating the PersonProject instance with the role of ADMIN
        PersonProject.objects.create(project=project, person=user, role=PersonProject.RoleChoices.ADMIN)

        return project
