export const ApiService = {
  async sendResetEmail(payload) {
    try {
      const response = await fetch("http://localhost:4000/auth/reset-password/sending-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  async getCCIId() {
    const response = await fetch("http://localhost:4000/auth/reset-password/sending-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // If needed, pass user details
    });

    if (!response.ok) throw new Error("Failed to fetch CCI ID");

    return response.json();
  },

  async login(payload) {
    const response = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Login failed");

    return response.json();

    },

	async validateResetToken(token) {
		try {
		  const response = await fetch(`http://localhost:4000/auth/validate-reset-token?token=${token}`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		  });
	  
		  if (!response.ok) {
			// Extract error message safely
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Invalid or expired token.");
		  }
	  
		  const data = await response.json();
		  return { success: true, data };
		} catch (error) {
		  return { success: false, message: error.message || "Something went wrong." };
		}
	  },

      async setPassword({ cci_id, password, confirm_password }) {
        try {
          const response = await fetch("http://localhost:4000/auth/set-password", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cci_id, password, confirm_password }),
          });
    
          const data = await response.json();
    
          if (!response.ok) {
            throw new Error(data.message || "Failed to set password.");
          }
    
          return data;
        } catch (error) {
          console.error("Set password error:", error);
          throw error;
        }
      },
	//   async checkToken() {
	// 	const result = await validateResetToken(token);
	  
	// 	if (!result.success) {
	// 	  console.error(result.message);
	// 	  errorMessage.value = result.message;
	// 	  return;
	// 	}
	  
	// 	cciId.value = result.data.cci_id; // Prefill CCI ID
	//   }		

};