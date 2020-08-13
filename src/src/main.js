var gl = null,
                canvas = null,
                glProgram = null,
                fragmentshader = null,
                vertexShader = null;

            var vertexPositionAttribute = null,
                vertexTexCoordAttribute = null,
				trianglesVerticeBuffer = null,
				trianglesTexCoordBuffer = null;

            var texture = [],
                textureImage = [];
                TEXTURE_1 = 0;
                TEXTURE_2 = 1;

            var mvMatrix = mat4.create();
            var pMatrix = mat4.create();

            var angle = 0.01;

            var paused = false,
                useTexture = false,
                useLightning = false;

            function loadTexture(){
				textureImage[TEXTURE_1] = new Image();
				textureImage[TEXTURE_1].onload = function() {
                    setupTexture(TEXTURE_1);
                    gl.uniform1i(glProgram.samplerUniform, 0);
				}
                textureImage[TEXTURE_1].src = "./resources/textures/brick_1.png";
                
                textureImage[TEXTURE_2] = new Image();
				textureImage[TEXTURE_2].onload = function() {
                    setupTexture(TEXTURE_2);
                    gl.uniform1i(glProgram.samplerUniform2, 1);
				}
                textureImage[TEXTURE_2].src = "./resources/textures/t_1.png";
                
                glProgram.uDoTexturing = gl.getUniformLocation(glProgram, "uDoTexturing");
                gl.uniform1i(glProgram.uDoTexturing, 1);
            }
            
            function setupTexture(i){
                gl.activeTexture(gl.TEXTURE0+i);


                texture[i] = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, texture[i]);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage[i]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

                //glProgram.uDoTexturing = gl.getUniformLocation(glProgram, "uDoTexturing");
                //console.log(glProgram.uDoTexturing);
                //gl.uniform1i(glProgram.uDoTexturing, 0);

                if(!gl.isTexture(texture[i])){
                	console.error("Error: Texture is invalid");
                }
            }

            function initWebGL(){
                canvas = document.getElementById("my-canvas");
                try{
                    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
                }catch(e){
                    console.log(e);
                }

                if (gl){
                    initShaders(
                    function(){
                        console.log(glProgram);
                        setupBuffers();
                        getMatrixUniforms();
                        loadTexture();
                        (function animLoop(){
                            if (!paused){
                                setupWebGl();
                                setMatrixUniforms();
                                drawScene();
                            }
                            requestAnimationFrame(animLoop, canvas);
                        })();
                    });
                    
                }else{
                    alert("Error: Your browser does not support WebGL.");
                }
            }

            function setupWebGl(){
                
                gl.clearColor(0.1, 0.5, 0.1, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.DEPTH_TEST);

                gl.viewport(0, 0, canvas.width, canvas.height);

                mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
                mat4.identity(mvMatrix);
                mat4.translate(mvMatrix, [-1.0, -1.0, -7.0]);
                mat4.rotate(mvMatrix, angle, [0.0, 1.0, 0.0]);
                angle += 0.005;
            }

            function initShaders(continueInit){
                var vsFile = 'src/shaders/vs-texture.vs';
                var fsFile = 'src/shaders/fs-multitexture.fs';

                var vs_source;
                var fs_source;
                var loadedVS = false;
                var loadedFS = false;
                console.log('Loading shaders');
                
                $.get(vsFile, function(content){
                    vs_source = content;
                    vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
                    loadedVS = true;
                    if (loadedVS && loadedFS){
                        buildGlProgram(vertexShader, fragmentShader);
                        gl.useProgram(glProgram);
                        continueInit();
                    }
                });

                $.get(fsFile, function(content){
                    fs_source = content;
                    loadedFS = true;
                    fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);
                    if (loadedVS && loadedFS){
                        buildGlProgram(vertexShader, fragmentShader);
                        gl.useProgram(glProgram);
                        continueInit();
                    }
                });                
            }

            function buildGlProgram(vShader, fShader){
                glProgram = gl.createProgram();
                gl.attachShader(glProgram, vertexShader);
                gl.attachShader(glProgram, fragmentShader);

                gl.linkProgram(glProgram);

                if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)){
                    alert("Unable to initialize the shader program.");
                }
                return glProgram;
            }

            function makeShader(src, type){
                var shader  = gl.createShader(type);
                gl.shaderSource(shader, src);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
                    alert ("Error compiling shader: " + gl.getShaderInfoLog(shader));
                }
                return shader;
            }

            function setupBuffers(){
                //12 vertices
				var triangleVerticesOriginal = [ 
					//front face
					//bottom left to right,  to top
					0.0, 0.0, 0.0,
					1.0, 0.0, 0.0,
					2.0, 0.0, 0.0,
					0.5, 1.0, 0.0,
					1.5, 1.0, 0.0,
					1.0, 2.0, 0.0,
					
					//rear face
					0.0, 0.0, -2.0,
					1.0, 0.0, -2.0,
					2.0, 0.0, -2.0,
					0.5, 1.0, -2.0,
					1.5, 1.0, -2.0,
					1.0, 2.0, -2.0
				];

				//16 triangles
				var triangleVertexIndices = [ 
					0,1,3,			//front face
					1,3,4,
					1,2,4,
					3,4,5,	

					6,7,9,			//rear face
					7,9,10,
					7,8,10,
					9,10,11,
					
					0,3,6,			//left side
					3,6,9,
					3,5,9,
					5,9,11,
					
					2,4,8,			//right side
					4,8,10,
					4,5,10,
					5,10,11
				];

				//48 vertices
				var triangleVertices = [];	
				var triangleTexCoords = [];

				for(var i=0; i<triangleVertexIndices.length; ++i){
					var a = triangleVertexIndices[i];

					triangleVertices.push(triangleVerticesOriginal[a*3]);
					triangleVertices.push(triangleVerticesOriginal[a*3 + 1]);
					triangleVertices.push(triangleVerticesOriginal[a*3 + 2]);

					if(i >= 24)
					{
						triangleTexCoords.push(triangleVerticesOriginal[a*3 + 1]);
						triangleTexCoords.push(triangleVerticesOriginal[a*3 + 2]);
					}else{
						triangleTexCoords.push(triangleVerticesOriginal[a*3]);
						triangleTexCoords.push(triangleVerticesOriginal[a*3 + 1]);
					}		
				}	

				trianglesVerticeBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);	
				trianglesTexCoordBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, trianglesTexCoordBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleTexCoords), gl.STATIC_DRAW);
            }

            function drawScene(){
                vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
                gl.enableVertexAttribArray(vertexPositionAttribute);
				gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
				gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

                vertexTexCoordAttribute = gl.getAttribLocation(glProgram, "aVertexTexCoord");
                gl.enableVertexAttribArray(vertexTexCoordAttribute);
				gl.bindBuffer(gl.ARRAY_BUFFER, trianglesTexCoordBuffer);
				gl.vertexAttribPointer(vertexTexCoordAttribute, 2, gl.FLOAT, false, 0, 0);
				
				gl.drawArrays(gl.TRIANGLES, 0, 16*3);
            }

            function getMatrixUniforms(){
                glProgram.pMatrixUniform = gl.getUniformLocation(glProgram, "uPMatrix");
                glProgram.mvMatrixUniform = gl.getUniformLocation(glProgram, "uMVMatrix");
                glProgram.samplerUniform = gl.getUniformLocation(glProgram, "uSampler");
                glProgram.samplerUniform2 = gl.getUniformLocation(glProgram, "uSampler2");
            }

            function setMatrixUniforms(){
                gl.uniformMatrix4fv(glProgram.pMatrixUniform, false, pMatrix);
                gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, mvMatrix);
            }