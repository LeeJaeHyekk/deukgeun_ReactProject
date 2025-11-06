#!/bin/bash

# SSL 인증서 교체 명령어 (복사해서 실행)

# AWS 리전
REGION="ap-northeast-2"

# ALB 정보
ALB_ARN="arn:aws:elasticloadbalancing:${REGION}:756811050863:loadbalancer/app/devtrail-alb/62d36f9401ba27cd"

# ACM 인증서 정보
CERTIFICATE_ARN="arn:aws:acm:${REGION}:756811050863:certificate/b8583643-fb13-46c0-a5da-5fedcfcbc509"

echo "=========================================="
echo "SSL 인증서 교체 명령어"
echo "=========================================="
echo ""
echo "1. 리스너 ARN 확인:"
echo "aws elbv2 describe-listeners \\"
echo "  --load-balancer-arn $ALB_ARN \\"
echo "  --region $REGION \\"
echo "  --query 'Listeners[?Port==\`443\`].ListenerArn' \\"
echo "  --output text"
echo ""
echo "2. 현재 인증서 확인:"
echo "aws elbv2 describe-listeners \\"
echo "  --listener-arns <LISTENER_ARN> \\"
echo "  --region $REGION \\"
echo "  --query 'Listeners[0].Certificates[0].CertificateArn' \\"
echo "  --output text"
echo ""
echo "3. 인증서 교체:"
echo "aws elbv2 modify-listener \\"
echo "  --listener-arn <LISTENER_ARN> \\"
echo "  --certificates CertificateArn=$CERTIFICATE_ARN \\"
echo "  --region $REGION"
echo ""
echo "4. 교체 확인:"
echo "aws elbv2 describe-listeners \\"
echo "  --listener-arns <LISTENER_ARN> \\"
echo "  --region $REGION \\"
echo "  --query 'Listeners[0].Certificates[0].CertificateArn' \\"
echo "  --output text"
echo ""
echo "=========================================="
