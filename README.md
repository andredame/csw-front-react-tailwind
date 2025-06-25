 ### Passos para Rodar o Backend
Para rodar o backend do projeto Spring Boot, siga os passos abaixo: 
1.  **Certifique-se de que o Docker e o Docker Compose estão instalados e funcionando corretamente.** Você pode verificar isso executando os seguintes comandos:
    ```bash
    docker --version
    docker compose version
    ```
2.  **Certifique-se de que o Maven está instalado e configurado corretamente.** Você pode verificar isso executando:
    ```bash
    mvn -v
    ```
3.  **Clone o repositório do projeto:**
    ```bash
    git clone https://github.com/andredame/csw25-grupof-sarc-spring.git
    ```

 **Navegue até a pasta raiz do projeto Spring Boot:**
```bash
    cd csw25-grupof-sarc-spring/csw
```

2.  **Suba os serviços do Docker Compose (Banco de Dados PostgreSQL e Keycloak):**
    ```bash
    docker compose up --build -d
    ```
    * O `--build` garante que as imagens mais recentes sejam construídas.
    * O `-d` roda os serviços em modo detached (em segundo plano).

3.  **Inicie o aplicativo Spring Boot:**
    ```bash
    mvn spring-boot:run
    ```
    * Aguarde até que o Spring Boot inicie completamente. Você verá mensagens de log indicando que a aplicação está rodando (geralmente na porta 8081).


### Passos para Rodar o Frontend

1.  **Abra uma nova aba no terminal.**
2.  **Navegue até a pasta raiz do projeto Frontend:**
    ```bash
    cd csw-front-react-tailwind
    ```

3.  **Instale as dependências do projeto:**
    ```bash
    npm install --legacy-peer-deps
    ```
    * O `--legacy-peer-deps` pode ser necessário para resolver problemas de compatibilidade de dependências em algumas versões do Node/npm.

4.  **Inicie o servidor de desenvolvimento do Next.js:**
    ```bash
    npm run dev
    ```
    * Aguarde até que o Next.js compile e inicie o servidor de desenvolvimento.

### Acessar a Aplicação
Após seguir os passos acima, você poderá acessar a aplicação no seu navegador:
- **Frontend:** [http://localhost:3000](http://localhost:3000)


# Credenciais de Acesso
TODAS AS SENHAS SÃO: `123456`

#### Usuários de exemplo

| Usuário         | Email                        | Senha   | Role        |
|-----------------|------------------------------|---------|-------------|
| andresilva      | andresilva@edu.pucrs.br      | 123456  | ALUNO       |
| edgar dos santos| edgardossantos@edu.pucrs.br  | 123456  | ADMIN       |
| maria eduarda   | mariaeduarda@edu.pucrs.br    | 123456  | COORDENADOR |
| john            | john@edu.pucrs.br            | 123456  | PROFESSOR   |



# FOTOS DA APLICAÇÂO 
Na aplicação é possivel visualizar as aulas do usuario, seja ela professor ou aluno, e também as aulas que o usuário está inscrito.

No cargo de ``coordenador`` é possível visualizar todas as turmas, podendo editar e excluir as turmas, além de visualizar os alunos e professores.`

No cargo de ``admintrador`` é possível visualizar todos os recursos do sistema, podendo editar e excluir os mesmos, além de visualizar os alunos, professores e coordenadores.

no cargo de ``professor`` é possível visualizar as aulas que o professor leciona, podendo editar e excluir as mesmas, além de visualizar os alunos que estão inscritos na aula.
