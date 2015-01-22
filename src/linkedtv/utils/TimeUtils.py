from datetime import datetime

class TimeUtils():

    @staticmethod
    def toStringSeconds(ms):
        if ms:
            ms = int(ms)
            return ms / 1000.0
        return 0

    @staticmethod
    def toMillis(sec):
        try:
            return int(float(sec) * 1000)
        except ValueError, e:
            return 0

    @staticmethod
    def srtTimeToMillis(t, useComma=True):
        #00:28:14,720 OR 00:28:14.720
        if t and len(t) > 0:
            try:
                if useComma:
                    d = datetime.strptime(t, '%H:%M:%S,%f')
                else:
                    d = datetime.strptime(t, '%H:%M:%S.%f')
            except ValueError, e:
                print e
                return 0
            ms = d.hour * 3600000 + d.minute * 60000 + d.second * 1000
            ms += d.microsecond / 1000
            return ms

    @staticmethod
    def toTimeTuple(mediafragmentTime):
        h = m = 0
        try:
            secs = int(mediafragmentTime.split('.')[0])
        except ValueError, e:
            return (0,0,0)
        while secs >= 3600:
            h += 1
            secs -= 3600
        while secs >= 60:
            m += 1
            secs -= 60
        return (h, m, secs)





