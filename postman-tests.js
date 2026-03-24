// Postman Tests - Coleção de testes para autenticação
// Adicione estes testes nas abas "Tests" de cada requisição

// ===== LOGIN - Tests =====
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    
    if (jsonData.session) {
        pm.environment.set("accessToken", jsonData.session.accessToken);
        pm.environment.set("refreshToken", jsonData.session.refreshToken);
        
        pm.test("Access token foi salvo", function() {
            pm.expect(jsonData.session.accessToken).to.not.be.empty;
        });
        
        pm.test("Refresh token foi salvo", function() {
            pm.expect(jsonData.session.refreshToken).to.not.be.empty;
        });
    }
    
    if (jsonData.user) {
        pm.test("User ID existe", function() {
            pm.expect(jsonData.user.id).to.not.be.empty;
        });
        
        pm.test("User email existe", function() {
            pm.expect(jsonData.user.email).to.not.be.empty;
        });
    }
    
    if (jsonData.profile) {
        pm.test("Profile role existe", function() {
            pm.expect(jsonData.profile.role).to.be.oneOf(['CLIENTE', 'ADMIN', 'GERENCIADOR', 'EQUIPE']);
        });
    }
}

// ===== REGISTER - Tests =====
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    
    pm.test("Registro bem-sucedido", function() {
        pm.expect(jsonData.success).to.be.true;
    });
    
    pm.test("Mensagem de sucesso presente", function() {
        pm.expect(jsonData.message).to.not.be.empty;
    });
}

// ===== LOGOUT - Tests =====
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    
    pm.test("Logout bem-sucedido", function() {
        pm.expect(jsonData.success).to.be.true;
    });
    
    // Limpar tokens
    pm.environment.set("accessToken", "");
    pm.environment.set("refreshToken", "");
}

// ===== REFRESH TOKEN - Tests =====
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    
    if (jsonData.session) {
        pm.environment.set("accessToken", jsonData.session.accessToken);
        pm.environment.set("refreshToken", jsonData.session.refreshToken);
        
        pm.test("Novo access token foi gerado", function() {
            pm.expect(jsonData.session.accessToken).to.not.be.empty;
        });
    }
}

// ===== GET PROFILE - Tests =====
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    
    pm.test("Usuário está autenticado", function() {
        pm.expect(jsonData.isAuthenticated).to.be.true;
    });
    
    if (jsonData.user) {
        pm.test("User ID existe", function() {
            pm.expect(jsonData.user.id).to.not.be.empty;
        });
    }
    
    if (jsonData.profile) {
        pm.test("Profile role existe", function() {
            pm.expect(jsonData.profile.role).to.be.oneOf(['CLIENTE', 'ADMIN', 'GERENCIADOR', 'EQUIPE']);
        });
    }
}

// ===== UPDATE PROFILE - Tests =====
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    
    pm.test("Perfil atualizado com sucesso", function() {
        pm.expect(jsonData.success).to.be.true;
    });
}

// ===== ERROS - Tests =====
if (pm.response.code === 401) {
    const jsonData = pm.response.json();
    
    pm.test("Erro retornado", function() {
        pm.expect(jsonData.error).to.not.be.empty;
    });
    
    // Limpar tokens em caso de erro de autenticação
    pm.environment.set("accessToken", "");
    pm.environment.set("refreshToken", "");
}
