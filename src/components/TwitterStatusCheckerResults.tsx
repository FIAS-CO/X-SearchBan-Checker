import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { apiClient } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { loadAd } from './adsense/AdSenseUtil';

interface CheckResult {
  url: string;
  code: number;
  status: string;
  message: string;
}

const TwitterStatusResults = () => {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAd()
  }, []);

  useEffect(() => {
    const checkUrls = async () => {
      const urlsJson = sessionStorage.getItem('checkUrls');
      if (!urlsJson) {
        navigate('/');
        return;
      }

      const urlList = JSON.parse(urlsJson);
      const checksPromises = urlList.map(async (url: string) => {
        try {
          const response = await apiClient.checkUrl(url);
          return {
            url,
            code: response.code,
            status: response.status,
            message: response.message,
          };
        } catch (error) {
          console.error('Error checking URL:', url, error);
          return {
            url,
            code: 500,
            status: 'UNKNOWN',
            message: 'Tweet not available',
          };
        }
      });

      const results = await Promise.all(checksPromises);
      setResults(results);
      setLoading(false);
      sessionStorage.removeItem('checkUrls');
    };

    checkUrls();
  }, [navigate]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">チェック中...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>チェック結果</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          入力画面に戻る
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {results.map((result, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border gap-2 md:gap-4"
            >
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all md:flex-1 md:min-w-0"
              >
                {result.url}
              </a>
              <div
                className={`px-3 py-1 rounded-md flex items-center justify-center md:justify-start shrink-0 ${result.status === 'NOT_FOUND' || result.status === 'UNKNOWN'
                  ? 'bg-gray-100 text-gray-700'
                  : result.status === 'FORBIDDEN'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                  }`}
              >
                {result.status === 'NOT_FOUND' || result.status === 'UNKNOWN'
                  ? 'チェックエラー'
                  : result.status === 'FORBIDDEN'
                    ? '検索除外'
                    : '検索OK'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TwitterStatusResults;