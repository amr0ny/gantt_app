from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render,redirect
from gantt.forms import SignUpForm
# Create your views here.

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('/signin/')
        
    elif request.method == 'GET':
        form = SignUpForm()
    return render(request, 'registration/signup.html', {'form': form})

def signin(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('/')
    elif request.method == 'GET':
        form = AuthenticationForm()
    return render(request, 'registration/signin.html', {'form': form})

#! Implement mechanism of remembering last project user worked on
@login_required
def index(request):
    current_project = request.user.current_project if hasattr(request.user, 'current_project') else None
    
    return render(request, 'index/project.html', {'project': project})

def project(request, id):
    return id