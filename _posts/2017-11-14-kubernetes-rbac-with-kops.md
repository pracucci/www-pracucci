---
layout:         post
title:          "Kubernetes RBAC with kops"
tags:           kubernetes kops
date:           2017-11-14 03:00:00 GMT
keywords:
---


Kops supports two authorization modes for the K8S cluster:

- `AlwaysAllow`: all users and service account tokens have cluster-wide privileges
- `RBAC`: all users and service account tokens honor RBAC roles


## Create a cluster with RBAC support

When you create a new K8S cluster with `kops` you have to explicitly set `--authorization RBAC`:

```
kops create cluster --authorization RBAC
```

The newly create cluster will have the authorization mode `RBAC` but no default super user. To give `admin` user the super user privileges you should edit with cluster with `kops edit cluster` and then add:

```
  kubeAPIServer:
    authorizationRbacSuperUser: admin
```



## Update an already existing cluster switching to RBAC

If you already have a cluster running with `AlwaysAllow` authorization mode and you wanna switch it to `RBAC` you have to edit the cluster with `kops edit cluster` and then edit:

```
  authorization:
    rbac: {}
```

and add the following to get the `admin` user having super user privileges (optional):

```
  kubeAPIServer:
    authorizationRbacSuperUser: admin
```

To apply the changes you're required to reboot all master nodes (remember to do it one-by-one in order to not disrupt your cluster).



## RBAC roles on a newly created cluster

According to [this discussion](https://stackoverflow.com/questions/41309420/how-to-create-users-groups-restricted-to-namespace-in-kubernetes-using-rbac-api) on StackOverflow, some roles and bindings are required in order to get an RBAC-cluster deployed with kops working. The following should be enough to fix `kube-proxy`, `kubelet` and the `default` service account running in the `kube-system` namespace.

```
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1alpha1
metadata:
  name: system:node--kubelet
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:node
subjects:
- kind: User
  name: kubelet
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1alpha1
metadata:
  name: cluster-admin--kube-system:default
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: default
  namespace: kube-system
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1alpha1
metadata:
  name: system:node-proxier--kube-proxy
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:node-proxier
subjects:
- kind: User
  name: kube-proxy
```


## Create an user on K8S

Kubernetes doesn't have any "user" resource you can manage through the API. The way you create and manage users depends on how you deployed the cluster. In the case of kops, the `kube-apiserver` runs with `--token-auth-file=/srv/kubernetes/known_tokens.csv`, reading user tokens from a .csv file with the following format:

```
token,user,uid,"group1,group2,group3"
```

where groups are optional. For example:

```
super-secret-token,user-name,user-unique-id
```

To **add a new user** you should manually create a file in the S3 bucket used by kops to hold the state at the location `secrets/USERNAME`. For example, if you wanna create the user "marco" you should create the file `secrets/marco` containing a json with the base64 encoded user authentication token (you can generate a random token):

```
{"Data":"BASE64-ENCODED-TOKEN-FOR-USER-MARCO"}
```

To apply the changes you should reboot the masters, since at boot kops will fetch all `secrets/` and generate the `.csv` on the fly before starting the API server.


### Add an user token to kubectl config

Now that the user has been created you can add it to your `~/.kube/config`:

```
users:
- name: marco
  user:
    token: NON-BASE64-ENCODED-TOKEN-FOR-USER-MARCO
```
