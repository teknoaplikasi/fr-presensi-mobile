pipeline {
    agent {
        docker { 
            image 'reactnativecommunity/react-native-android'
            args '-u root --privileged'
        }
    }
    stages {
        stage('Build') {
            steps {
                sh 'yarn install'
                sh 'yarn jetify'
                sh 'cd android && chmod +x gradlew'
                sh 'cd android && ./gradlew assembleRelease'
            }
        }
        stage('Upload') {
            steps {
                sh 'mv ./android/app/build/outputs/apk/release/app-release.apk ./android/app/build/outputs/apk/release/face-recognition.apk'
                sh 'curl -F file=@android/app/build/outputs/apk/release/face-recognition.apk -F "initial_comment=Face Recognition App" -F channels=D010J29FWC8 -H "Authorization: Bearer $SLACK_TOKEN" https://slack.com/api/files.upload'
            }
        }
    }
}