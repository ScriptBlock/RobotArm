

			if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			var container, stats;

			var camera, scene, renderer, light;

			var base, mesh2, mesh3, mesh4, hand;  // robot parts
      var geom = [], flower = [];
      var tweens = [{tween:{},status:false},{tween:{},status:false},{tween:{},status:false},{tween:{},status:false}];

			var dummy = new THREE.Object3D();  // base to body joint (rotation limited to y axis)
			var dummy2 = new THREE.Object3D(); // body to arm1 (rotation limited to z axis)
			var dummy3 = new THREE.Object3D(); // arm1 to arm2 (rotation limited to z axis)
			var dummy4 = new THREE.Object3D(); // arm2 to hand (rotation limited to z axis)

			var dummyArray = [];

			// use this for keyboard control
			var tabValue = 0;

      // cameria variables
      var radious = 7000, theta = 45, phi = 60, onMouseDownTheta = 45, onMouseDownPhi = 60,
          isMouseDown = false, onMouseDownPosition, mouse3D, projector, ray;

			init();
			animate();

			function init() {

				container = document.getElementById( 'container' );

				camera = new THREE.Camera( 60, window.innerWidth / window.innerHeight, 1, 15000 );
				camera.position.x = radious * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
				camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
				camera.position.z = radious * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
				camera.target.position.y = 200;
				//camera.lookAt(0,200,0);

				scene = new THREE.Scene();

				scene.addLight( new THREE.AmbientLight( 0x333333 )  );

				light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 0, 0, 1 );
				light.position.normalize();
				scene.addLight( light );

        //load robot model
				var loader = new THREE.JSONLoader();

				loader.load( { model: "obj/robot_arm_base.js", callback: createBase } );
				loader.load( { model: "obj/robot_arm_body.js", callback: createBody } );
				loader.load( { model: "obj/robot_arm_arm1.js", callback: createArm1 } );
				loader.load( { model: "obj/robot_arm_arm2.js", callback: createArm2 } );
				loader.load( { model: "obj/robot_arm_hand.js", callback: createHand } );

        // renderer start
				//renderer = new THREE.CanvasRenderer();
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setSize( window.innerWidth, window.innerHeight );

				container.appendChild( renderer.domElement );

				//document.addEventListener( 'keydown', onDocumentKeyDown, false );
				//document.addEventListener( 'click', moveRobot, false );

        setInterval(function () {moveRobot()}, 3000);
			}
			//keyboard events
			// function onDocumentKeyDown( event ) {

			// 	switch( event.keyCode ) {

			// 		case 32: toggleJoint(); break;         // space
			// 		case 37: offsetScene(-1,0); break;     //arrow <-
			// 		case 39: offsetScene( 1,0); break;     //arrow ->
   //        case 13: moveRobot(); break;           //enter

			// 	}

			// }
      function toggleJoint() {

          if (tabValue === dummyArray.length - 1) {
              tabValue = 0;
          }
          else {
              tabValue++;
          }

      }
			function offsetScene( offsetX, offsetY ) {

			    var mag = 0.01;
			    // currently offsetY not used
			    if (dummyArray[tabValue].control === 'y') {
            dummyArray[tabValue].rotation.y = dummyArray[tabValue].rotation.y + Math.sin(offsetX*mag);
          }
          if (dummyArray[tabValue].control === 'z') {
              dummyArray[tabValue].rotation.z = dummyArray[tabValue].rotation.z + Math.sin(offsetX*mag);
          }
			}


      function cloneMesh() {

        // base  geom[0]
        // mesh2 geom[1]
        // mesh3 geom[2]
        // mesh4 geom[3]
        // hand  geom[4]

				var material = new THREE.MeshFaceMaterial();
				var tempMesh = new THREE.Mesh( geom[2], material);

				tempMesh.scale.x = tempMesh.scale.y = tempMesh.scale.z = 75;

        tempMesh.position.copy( mesh3.matrixWorld.getPosition() );

        scene.addObject(tempMesh);

        flower.push(tempMesh);
			}

			function createBase( geometry ) {

				//geometry.materials[0][0].shading = THREE.FlatShading;
        geom[0] = geometry;
				var material = new THREE.MeshFaceMaterial();

				base = new THREE.Mesh( geometry, material);

				base.scale.x = base.scale.y = base.scale.z = 75;

				// adding joint for body
				base.addChild (dummy);
				// control body location by moving joint x,y,z
				dummy.position.y = 18;
				dummy.control = 'y'; // y axis is controlled
				// add all dummy joints to an array so i can control them easier later
				dummyArray.push(dummy);


			}

			function createBody( geometry ) {

				//geometry.materials[0][0].shading = THREE.FlatShading;
        geom[1] = geometry;
				var material = new THREE.MeshFaceMaterial();

				mesh2 = new THREE.Mesh( geometry, material );

				dummy.addChild(mesh2);

				// adding joint for arm1
				dummy.addChild(dummy2);
				dummy2.position.x = 0;
				dummy2.position.y = -8;
				dummy2.control = 'z'; // z axis is controlled
				dummyArray.push(dummy2);

			}

			function createArm1( geometry ) {

				//geometry.materials[0][0].shading = THREE.FlatShading;
        geom[2] = geometry;
				var material = new THREE.MeshFaceMaterial();

				mesh3 = new THREE.Mesh( geometry, material );

				dummy2.addChild(mesh3);

				// add joint for arm 2
				dummy2.addChild(dummy3);
				// these offsets are set manually
				dummy3.position.x = -14.5;
				dummy3.position.y = 13;
				dummy3.control = 'z';
				dummyArray.push(dummy3);

			}
			function createArm2( geometry ) {

				//geometry.materials[0][0].shading = THREE.FlatShading;
        geom[3] = geometry;
				var material = new THREE.MeshFaceMaterial();

				mesh4 = new THREE.Mesh( geometry, material );

				dummy3.addChild(mesh4);

				dummy3.addChild(dummy4);
				// these offsets are set manually
				dummy4.position.x = -18.5;
				dummy4.position.y = 5.5;
				dummy4.control = 'z';
				dummyArray.push(dummy4);

			}
			function createHand( geometry ) {

				//geometry.materials[0][0].shading = THREE.FlatShading;

				var material = new THREE.MeshFaceMaterial();
        geom[4] = geometry;
				hand = new THREE.Mesh( geometry, material );

				dummy4.addChild(hand);
				scene.addObject( base );

			}
			function animate() {

				requestAnimationFrame( animate );
        TWEEN.update();
				render();

			}

			function render() {

				renderer.render( scene, camera );

			}
      function moveRobot () {

        // check to make sure no tween is active
        for (var i in tweens) {
          if (tweens[i].status) {  // if status = true then tween in progress
            return false;
          }
        }

        var mag  = 4;
        var time = 6000;
        // currently offsetY not used
        for (var i in dummyArray) {

          if (Math.random() > 0.5) {

            var sign  = -1;

          } else {

            var sign = 1;

          }

          if (dummyArray[i].control === 'y') {
            tweens[i].status = true;
            tweens[i].tween = new TWEEN.Tween( { y : dummyArray[i].rotation.y, obj : dummyArray[i], tween : tweens[i] } )
              .to( { y : dummyArray[i].rotation.y + ((mag * Math.random()) * sign) }, time * Math.random() )
              .onUpdate( function () {
                this.obj.rotation.y = this.y;
              } )
              .easing( TWEEN.Easing.Exponential.InOut )
              .onComplete( function () {
                this.tween.status = false;
              })
              .start();
          }
          if (dummyArray[i].control === 'z') {
            tweens[i].status = true;
            tweens[i].tween = new TWEEN.Tween( { z : dummyArray[i].rotation.z, obj : dummyArray[i], tween : tweens[i] } )
              .to( { z : dummyArray[i].rotation.z + ((mag * Math.random())*sign) }, time * Math.random() )
              .onUpdate( function () {
                this.obj.rotation.z = this.z;
              } )
              .easing( TWEEN.Easing.Exponential.InOut )
              .onComplete( function () {
                this.tween.status = false;
              })
              .start();
          }
        }
        return true;
      }
		